import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsDate, IsOptional, IsArray, isString } from 'class-validator';

export class CreateNeedListDto {
  @ApiProperty({ example: 'Food Donation Drive' })
  @IsString()
  needlist_name: string;

  @ApiProperty({ example: 'Draft' })
  @IsString()
  needlist_status: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  total_donated: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  total_items: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  total_price: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  total_tax: number;

  @ApiProperty({ example: 'Sep 30, 2025' })
  @IsString()
  due_date: string;

//Optional values just for now

  @ApiProperty({ example: ['/groups/i5bu4dnoSy...', '/groups/aB12cdEfG...'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  group_id: string[] | null;

  @ApiProperty({ example: '/organization/U63tWq...' })
  @IsOptional()
  @IsString()
  org_id: string | null;

  @ApiProperty({ example: '/users/RzKs6he1...' })
  @IsOptional()
  @IsString()
  user_id: string | null;

  @ApiProperty({ example: '/locations/dL34sP...' })
  @IsOptional()
  @IsString()
  location_id: string | null;


  // Optional timestamps — these are usually auto-set in the service
  @ApiProperty({ example: '2023-10-01T12:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  created_at?: string;

  @ApiProperty({ example: '2023-10-01T12:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  last_updated?: string;
}
