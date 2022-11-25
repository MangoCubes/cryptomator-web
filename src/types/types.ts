export type DirCache<T> = {[key: string]: {
	child: T[];
	explored: ExpStatus;
}};

export enum ExpStatus {
	Ready,
	Querying,
	NotStarted,
	Error
}