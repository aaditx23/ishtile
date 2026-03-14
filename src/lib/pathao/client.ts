import { PathaoClient } from "pathao-courier";
import { getPathaoConfigFromEnv } from "./helpers";

export const pathaoClient = new PathaoClient(getPathaoConfigFromEnv());
