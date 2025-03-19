export interface IUser {
    _id?: string
    name: string;
    email: string;
    phone: number
    password?: string;
    confirmPassword?: string
    profile?: string
    role: 'Admin' | 'User'
    status?: 'active' | 'inactive';
    token?: string
}