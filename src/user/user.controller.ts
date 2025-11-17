import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.users.findById(Number(id));
    return user;
  }
}
