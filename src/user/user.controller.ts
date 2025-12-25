import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RegisterUserDto } from './dto';
import { UserService } from './user.service';
import { CurrentUser } from '../common/decorators/current.user.decorator';

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // -------------------------------------------------------------------------
  // REGISTER USER
  // -------------------------------------------------------------------------
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDto })
  @ApiCreatedResponse({
    description: 'User successfully registered.',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.registerUser(registerUserDto);
  }

  // -------------------------------------------------------------------------
  // GET CURRENT USER PROFILE
  // -------------------------------------------------------------------------
  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get profile of the currently authenticated user' })
  @ApiBearerAuth() // <-- shows lock icon, requires Authorization header
  @ApiOkResponse({
    description: 'Returns current user profile.',
  })
  @ApiUnauthorizedResponse({
    description: 'No or invalid authentication token.',
  })
  @ApiNotFoundResponse({
    description: 'User profile not found.',
  })
  async getCurrentUser(@CurrentUser() user: any) {
    const profile = await this.userService.getUserProfile(user.email);

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return { UserProfile: profile };
  }


}
