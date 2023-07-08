import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationDto } from 'src/notification/dto/create-notification.dto';
import { UpdateNotificationDto } from 'src/notification/dto/update-notification.dto';
import { NotificationService } from 'src/notification/notification.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  create(user: CreateUserDto): Promise<User> { // 유저 생성
    return this.userRepository.save(user);
  }

  updateProfile = async (user_id: number, update_dto: UpdateUserDto): Promise<any> => { // 유저 정보 수정
    try {
      const user = await this.userRepository.findOne({
        where: { id: user_id },
      });

      const updated_user = {
        ...user, // js 스프레드 문법, 객체에서의 스프레드 연산자: 객체의 프로퍼티를 업데이트 하거나 복사할 수 있다.
        username: update_dto.username,
        email: update_dto.email,
      };

      const saved_user = await this.userRepository.save(updated_user);

      if (saved_user) { // 수정된 유저를 저장했다면 알림을 보냄.
        // send push notification
        await this.notificationService
          .sendPush(
            updated_user,
            update_dto.title,
            update_dto.body
          )
          .catch((e) => {
            console.log('Error sending push notification', e);
          });
      }

      return saved_user;
    } catch (error) {
      return error;
    }
  };

  enablePush = async ( // 알림 설정 활성
    user_id: number,
    update_dto: NotificationDto,
  ): Promise<any> => {
    const user = await this.userRepository.findOne({
      where: { id: user_id },
    });
    return await this.notificationService.acceptPushNotification(
      user,
      update_dto,
    );
  };

  disablePush = async ( // 알림 설정 비활성
    user_id: number,
    update_dto: UpdateNotificationDto,
  ): Promise<void> => {
    const user = await this.userRepository.findOne({
      where: { id: user_id },
    });
    await this.notificationService.disablePushNotification(user, update_dto);
  };

  getPushNotifications = async (): Promise<any> => { // 알림 내용 조회하기
    return await this.notificationService.getNotifications();
  };
}