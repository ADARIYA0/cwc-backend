import { UserAccountType } from "../../../domain/enums/UserAccountType";

export interface RegisterDTO {
    fullName: string;
    email: string;
    password: string;
    passwordConfirm: string;
}

export interface RegisterResponseDTO {
    id: string;
    email: string;
    fullName: string;
    accountType: UserAccountType;
    createdAt: Date;
}
