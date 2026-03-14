'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Order } from '@/domain/order/order.entity';
import { updateDeliveryMode } from '@/application/order/updateDeliveryMode';
import {
  createPathaoParcel,
  PathaoParcelValidationError,
} from '@/application/order/createPathaoParcel';
import { refreshPathaoStatus } from '@/application/order/refreshPathaoStatus';

interface DeliveryManagementCardProps {
  order: Order;
  onOrderChange: (next: Order) => void;
}

function normalizeStatus(status: string | null | undefined): string {
  return (status ?? 'pending').toLowerCase();
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status.includes('delivered')) return 'default';
  if (status.includes('cancel') || status.includes('return')) return 'destructive';
  if (status.includes('transit') || status.includes('picked')) return 'secondary';
  return 'outline';
}

export default function DeliveryManagementCard({ order, onOrderChange }: DeliveryManagementCardProps) {
  const [mode, setMode] = useState<'manual' | 'pathao'>(order.deliveryMode ?? 'manual');
  const [savingMode, setSavingMode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [serverMissingFields, setServerMissingFields] = useState<string[]>([]);

  const [recipientName, setRecipientName] = useState(order.shippingName ?? '');
  const [recipientPhone, setRecipientPhone] = useState(order.shippingPhone ?? '');
  const [recipientAddress, setRecipientAddress] = useState(order.shippingAddress ?? '');
  const [recipientCity, setRecipientCity] = useState(String(order.shippingCityId ?? ''));
  const [recipientZone, setRecipientZone] = useState(String(order.shippingZoneId ?? ''));
  const [recipientArea, setRecipientArea] = useState(String(order.shippingAreaId ?? ''));
  const [deliveryType, setDeliveryType] = useState(48);
  const [itemWeight, setItemWeight] = useState('500');
  const [itemQuantity, setItemQuantity] = useState(String(order.items?.length || 1));
  const [amountToCollect, setAmountToCollect] = useState(String(order.total ?? 0));
  const [specialInstruction, setSpecialInstruction] = useState('');

  const missingRequired = useMemo(() => {
    const missing: string[] = [];
    if (!recipientName.trim()) missing.push('Recipient Name');
    if (!recipientPhone.trim()) missing.push('Phone');
    if (!recipientAddress.trim()) missing.push('Address');
    if (!Number(recipientCity)) missing.push('Recipient City');
    if (!Number(recipientZone)) missing.push('Recipient Zone');
    if (!Number(itemWeight)) missing.push('Item Weight');
    if (!Number(itemQuantity)) missing.push('Item Quantity');
    if (!Number(amountToCollect)) missing.push('Amount to Collect');
    return missing;
  }, [amountToCollect, itemQuantity, itemWeight, recipientAddress, recipientCity, recipientName, recipientPhone, recipientZone]);

  const pathaoStatus = normalizeStatus(order.pathaoStatus);
  const isPersistedPathaoMode = (order.deliveryMode ?? 'manual') === 'pathao';
  const hasPathaoConsignment = Boolean(order.pathaoConsignmentId);

  const handleSaveMode = async () => {
    setSavingMode(true);
    try {
      const updated = await updateDeliveryMode(order.id, mode);
      onOrderChange(updated);
      toast.success(`Delivery mode updated to ${mode}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update delivery mode');
      setMode(order.deliveryMode ?? 'manual');
    } finally {
      setSavingMode(false);
    }
  };

  const handleCreateParcel = async () => {
    if (!isPersistedPathaoMode) {
      toast.error('Save delivery mode as Pathao first.');
      return;
    }

    if (missingRequired.length) {
      toast.error(`Missing required fields: ${missingRequired.join(', ')}`);
      return;
    }

    setCreating(true);
    setServerMissingFields([]);
    try {
      const result = await createPathaoParcel(order.id, {
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        recipientAddress: recipientAddress.trim(),
        recipientCity: Number(recipientCity),
        recipientZone: Number(recipientZone),
        recipientArea: Number(recipientArea) || undefined,
        deliveryType,
        itemWeight: Number(itemWeight),
        itemQuantity: Number(itemQuantity),
        amountToCollect: Number(amountToCollect),
        specialInstruction: specialInstruction.trim() || undefined,
      });

      onOrderChange({
        ...order,
        deliveryMode: 'pathao',
        pathaoConsignmentId: result.consignmentId,
        pathaoStatus: result.pathaoStatus,
        pathaoPrice: result.deliveryFee,
      });
      toast.success('Pathao parcel created successfully');
    } catch (error) {
      if (error instanceof PathaoParcelValidationError) {
        setServerMissingFields(error.missingFields);
      }
      toast.error(error instanceof Error ? error.message : 'Failed to create Pathao parcel');
    } finally {
      setCreating(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!order.pathaoConsignmentId) {
      toast.error('Consignment ID missing. Create parcel first.');
      return;
    }

    setRefreshing(true);
    try {
      const result = await refreshPathaoStatus(order.pathaoConsignmentId);
      onOrderChange({
        ...order,
        pathaoStatus: result.pathaoStatus,
      });
      toast.success('Pathao status refreshed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to refresh Pathao status');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelPathao = async () => {
    setMode('manual');
    setSavingMode(true);
    try {
      const updated = await updateDeliveryMode(order.id, 'manual');
      onOrderChange(updated);
      toast.success('Delivery reset to manual mode');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset delivery mode');
    } finally {
      setSavingMode(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Management</CardTitle>
        <CardDescription>Select delivery mode and manage Pathao parcel lifecycle.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Delivery Mode</p>
          <div className="flex gap-2">
            <Select value={mode} onChange={(e) => setMode(e.target.value as 'manual' | 'pathao')}>
              <option value="manual">Manual Delivery</option>
              <option value="pathao">Pathao Delivery</option>
            </Select>
            <Button onClick={handleSaveMode} disabled={savingMode || mode === order.deliveryMode}>
              {savingMode ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {(mode === 'pathao' || (order.deliveryMode === 'pathao' && order.pathaoConsignmentId)) && (
          <div className="space-y-3 border rounded-lg p-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pathao-recipient-name">Recipient Name</Label>
                <Input id="pathao-recipient-name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Recipient Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pathao-phone-number">Phone Number</Label>
                <Input id="pathao-phone-number" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="Phone Number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pathao-address">Address</Label>
                <Input id="pathao-address" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder="Address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pathao-city">City</Label>
                <Input id="pathao-city" value={recipientCity} onChange={(e) => setRecipientCity(e.target.value)} placeholder="Recipient City ID" type="number" min={1} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pathao-zone">Zone</Label>
                <Input id="pathao-zone" value={recipientZone} onChange={(e) => setRecipientZone(e.target.value)} placeholder="Recipient Zone ID" type="number" min={1} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pathao-area">Area</Label>
                <Input id="pathao-area" value={recipientArea} onChange={(e) => setRecipientArea(e.target.value)} placeholder="Recipient Area ID (optional)" type="number" min={1} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pathao-delivery-type">Delivery Type</Label>
                <Select id="pathao-delivery-type" value={String(deliveryType)} onChange={(e) => setDeliveryType(Number(e.target.value))}>
                  <option value="48">Regular Delivery</option>
                  <option value="12">On Demand Delivery</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pathao-amount-to-collect">Amount to Collect</Label>
                <Input id="pathao-amount-to-collect" value={amountToCollect} onChange={(e) => setAmountToCollect(e.target.value)} placeholder="Amount to Collect" type="number" min={0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pathao-item-quantity">Item Quantity</Label>
                <Input id="pathao-item-quantity" value={itemQuantity} onChange={(e) => setItemQuantity(e.target.value)} placeholder="Item Quantity" type="number" min={1} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pathao-item-weight">Item Weight</Label>
                <Input id="pathao-item-weight" value={itemWeight} onChange={(e) => setItemWeight(e.target.value)} placeholder="Item Weight (grams)" type="number" min={1} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="pathao-special-instruction">Special Instruction</Label>
                <Input
                  id="pathao-special-instruction"
                  value={specialInstruction}
                  onChange={(e) => setSpecialInstruction(e.target.value)}
                  placeholder="Special instruction (optional)"
                />
              </div>
            </div>

            {missingRequired.length > 0 && (
              <p className="text-xs text-destructive">
                Missing required fields: {missingRequired.join(', ')}
              </p>
            )}
            {serverMissingFields.length > 0 && (
              <p className="text-xs text-destructive">
                Backend validation missing: {serverMissingFields.join(', ')}
              </p>
            )}

            {isPersistedPathaoMode && (
              <div className="flex flex-wrap gap-2">
                {!hasPathaoConsignment && (
                  <Button onClick={handleCreateParcel} disabled={creating}>
                    {creating ? 'Creating...' : 'Create Pathao Parcel'}
                  </Button>
                )}
                {hasPathaoConsignment && (
                  <Button variant="outline" onClick={handleRefreshStatus} disabled={refreshing}>
                    {refreshing ? 'Refreshing...' : 'Refresh Pathao Status'}
                  </Button>
                )}
                <Button variant="destructive" onClick={handleCancelPathao} disabled={savingMode}>
                  Cancel Order
                </Button>
                {hasPathaoConsignment && (
                  <Button asChild variant="secondary">
                    <a
                      href={`https://merchant.pathao.com/tracking?consignment_id=${encodeURIComponent(order.pathaoConsignmentId!)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Tracking
                    </a>
                  </Button>
                )}
              </div>
            )}
            {!isPersistedPathaoMode && (
              <p className="text-xs text-muted-foreground">
                Save delivery mode as Pathao before creating a parcel.
              </p>
            )}

            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Consignment ID</span>
                <span className="font-mono text-xs">{order.pathaoConsignmentId || 'Not created'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pathao Status</span>
                <Badge variant={statusVariant(pathaoStatus)}>{pathaoStatus}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>৳{Number(order.pathaoPrice ?? 0).toFixed(0)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
