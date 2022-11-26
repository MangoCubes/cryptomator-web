export enum ExpStatus {
	Ready,
	Querying,
	NotStarted,
	Error
}

export type DirCache<T> = {[key: string]: {
	child: T[];
	explored: ExpStatus.Ready;
} | {
	explored: Exclude<ExpStatus, ExpStatus.Ready>;
}};
