import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly updateNotificationDto: UpdateNotificationDto
  ) {}

  // @Post()
  // create(@Body() createNotificationDto: NotificationDto) {
  //   return this.notificationService.notification_token(createNotificationDto);
  // }

  @Get()
  findAll() {
    return this.notificationService.getNotifications();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.notificationService.findOne(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.disablePushNotification(+id, updateNotificationDto);
  }
}
