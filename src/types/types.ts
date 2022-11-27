export enum ExpStatus {
	Ready,
	Querying,
	NotStarted,
	Error
}

export type DirCache<T> = {[key: string]: {
	child: T[];
	explored: ExpStatus.Ready | ExpStatus.Querying;
} | {
	explored: ExpStatus.NotStarted | ExpStatus.Error;
}};
