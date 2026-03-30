import { PartialType } from '@nestjs/swagger';
import { ApplyCoachDto } from './apply-coach.dto';

export class UpdateApplicationDto extends PartialType(ApplyCoachDto) {}
