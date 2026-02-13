import { IsEmail, IsString } from "class-validator";

export class MemberAuthDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}