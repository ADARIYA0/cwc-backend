import { UserAccountType } from "../../../domain/user/enums/account-type";

export interface RegisterDTO {
    fullName: string;
    email: string;
    password: string;
    passwordConfirm: string;
    accountType: UserAccountType;
}
