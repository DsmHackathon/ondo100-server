import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Put,
} from '@nestjs/common';
import { NotificationDto } from 'src/notification/dto/create-notification.dto';
import { UpdateNotificationDto } from 'src/notification/dto/update-notification.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async CreateUser(@Body() user: CreateUserDto) { // 유저 생성
    return await this.usersService.create(user);
  }

  @Put(':user_id')
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Body() update_dto: UpdateUserDto, @Param('user_id') user_id: number) { // 유저 정보 수정
    return await this.usersService.updateProfile(user_id, update_dto);
  }

  @Put(':user_id/push/enable')
  @HttpCode(HttpStatus.OK)
  async enablePush( // 알림 설정 허용
    @Body() update_dto: NotificationDto,
    @Param('user_id') user_id: number,
  ) {
    return await this.usersService.enablePush(user_id, update_dto);
  }

  @Put(':user_id/push/disable')
  @HttpCode(HttpStatus.OK)
  async disablePush( // 알림 설정 변경
    @Param('user_id') user_id: number,
    @Body() update_dto: UpdateNotificationDto,
  ) {
    return await this.usersService.disablePush(user_id, update_dto);
  }

  @Get('push/notifications')
  @HttpCode(HttpStatus.OK)
  async fetchPushNotifications() { // 알림 내용 조회하기 (제목, 내용 띄워줄 것들 가져오기)
    return await this.usersService.getPushNotifications();
  }
}