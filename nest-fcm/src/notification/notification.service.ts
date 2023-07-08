import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notifications } from './entities/notification.entity';
import { Repository } from 'typeorm';
import * as firebase from 'firebase-admin';
import { NotificationToken } from './entities/notification-token.entity';
import { NotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

firebase.initializeApp({
  credential: firebase.credential.applicationDefault(),
});

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notifications)
    private readonly notificationsRepo: Repository<Notifications>,
    @InjectRepository(NotificationToken)
    private notificationTokenRepo: Repository<NotificationToken>,
  ) {}

  acceptPushNotification = async ( // 알림 설정 활성
    user: any,
    notification_dto: NotificationDto,
  ): Promise<NotificationToken> => {
    await this.notificationTokenRepo.update(
      { user: { id: user.id } },
      {
        status: 'INACTIVE',
      },
    );
    // save to db
    const notification_token = await this.notificationTokenRepo.save({
      user: user,
      device_type: notification_dto.device_type,
      notification_token: notification_dto.notification_token,
      status: 'ACTIVE',
    });
    return notification_token;
  };

  disablePushNotification = async ( // 알림 설정 비활성
    user: any,
    update_dto: UpdateNotificationDto,
  ): Promise<void> => {
    try {
      await this.notificationTokenRepo.update(
          { user: { id: user.id } },
          {
            device_type: update_dto.device_type,
            status: 'INACTIVE',
          });
      console.log("OK");
    } catch (error) {
      return error;
    }
  };

  getNotifications = async (): Promise<any> => { // 알림 내용 조회하기
    return await this.notificationsRepo.find();
  };

  sendPush = async (user: any, title: string, body: string): Promise<void> => { // 알림 내용 추가하기
    try {
      const notification = await this.notificationTokenRepo.findOne({ // 상태가 'ACTIVE'인 유저를 찾음 (알림 허용한 느낌인 듯)
        where: {
          user: { id: user.id },
          status: 'ACTIVE'
        },
      });
      if (notification) {
        await this.notificationsRepo.save({
          notification_token: notification,
          title,
          body,
          status: 'ACTIVE',
          created_by: user.username,
        });
        console.log('OK');
        await firebase
          .messaging()
          .send({
            notification: { title, body },
            token: notification.notification_token,
            android: { priority: 'high' },
          })
          .catch((error: any) => {
            console.error(error);
          });
      }
    } catch (error) {
      return error;
    }
  };
}