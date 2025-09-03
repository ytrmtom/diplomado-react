export type UserFilterDoneType = 'true' | 'false' | 'all';

export type UserType = {
    id: number;
    username: string;
    password: string;
    status: string;
};