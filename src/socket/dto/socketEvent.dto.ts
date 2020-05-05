import { IsNotEmpty } from 'class-validator';

export class SocketEventDto {
  @IsNotEmpty()
  eventType: string;

  @IsNotEmpty()
  payload: string;
}
