// src/need-list/dto/all-needlists.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class AllNeedListsDto {
  @Expose()
  @ApiProperty({ example: 'nL1234567890abcdef' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Food Donation Drive' })
  needlist_name: string;

  @Expose()
  @ApiProperty({ example: 'Draft' })
  needlist_status: string;

  @Expose()
  @ApiProperty({ example: 0 })
  total_donated: number;

  @Expose()
  @ApiProperty({ example: 0 })
  total_items: number;

  @Expose()
  @ApiProperty({ example: 0 })
  total_price: number;

  @Expose()
  @ApiProperty({ example: 0 })
  total_tax: number;

  @Expose()
  @ApiProperty({ example: '2025-10-21T14:33:13.507Z' })
  @IsOptional()
  due_date?: string;

  @Expose() 
  @ApiProperty({ example: '2025-10-21T14:33:13.507Z' })
  @IsOptional()
  created_at?: string;

  @Expose()
  @ApiProperty({ example: '2025-10-21T14:33:13.507Z' })
  @IsOptional()
  last_updated?: string;

  @Expose()
  @ApiProperty({ example: '/users/abc123' })
  user_id?: string | null;

  @Expose() 
  @ApiProperty({ example: '/organization/xyz456' })
  org_id?: string | null;

  @Expose() 
  @ApiProperty({ example: '/locations/lmno789' })
  location_id?: string | null;

  @Expose()
  @ApiProperty({ example: ['/groups/documentreference', '/groups/documentreference'] })
  group_id?: string[] | null;
}
