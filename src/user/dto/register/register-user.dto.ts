import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
export class RegisterUserDto {

  @ApiProperty({ description: "The user's email address" })
  @IsNotEmpty()
  @IsEmail()
  user_email: string;

  @ApiProperty({ description: "The user's password" })
  @IsNotEmpty()
  @Length(8, 20)
  password: string;


}