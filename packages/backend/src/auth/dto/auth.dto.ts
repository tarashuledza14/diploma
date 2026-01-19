import { IsEmail, IsString, MinLength } from 'class-validator'

export class AuthDto {
	@IsEmail()
	@IsString()
	email: string

	@MinLength(8, {
		message: 'Password must be at least 6 symbols long'
	})
	@IsString()
	password: string
}
export class RegisterDto {
	@IsEmail()
	@IsString()
	email: string

	@MinLength(8, {
		message: 'Password must be at least 6 symbols long'
	})
	@IsString()
	password: string

	@IsString()
	firstName: string
	
	@IsString()
	lastName: string
}
