import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AllNeedListsDto } from './models/all-needlists.dto';
import { NeedListService } from './need-list.service';

// import { AuthGuard } from '../common/guards/auth.guard';
// import { SystemRoles } from '../common/decorators/systemLevel.decorator';
// import { SystemRolesGuard } from '../common/guards/system.roleGuard';

@ApiTags('NeedList') // <-- This adds a category in Swagger
// @UseGuards(AuthGuard, SystemRolesGuard)
// @SystemRoles('nlo_staff')
@Controller('need-list')
export class NeedListController {
  constructor(private readonly needListService: NeedListService) {}

  @Get()
  @ApiQuery({
    name: 'sort',
    required: false,
    example: 'created_at:desc',
    description: 'Sort the need lists by specific fields',
  })
  @ApiQuery({
    name: 'startAfter',
    required: false,
    example: '150,2025-10-18T14:23:00Z',
    description: 'Pagination cursor (values from the last item\’s sort fields)',
  })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Limit the number of results returned' })
  @ApiQuery({
    name: 'name',
    required: false,
    example: 'Food',
    description: 'Prefix search by need list name (starts-with)',
  })
  // @ApiResponse({ status: 200, description: 'List all need lists', type: [Object] })
  @ApiOkResponse({ description: 'Successfully retrieved need lists.', type: [AllNeedListsDto] })
  @ApiInternalServerErrorResponse({
    description: 'Failed to retrieve needlists, likely due to multiple sort parameters',
  })
  @ApiNotFoundResponse({ description: 'Found no needlists with search conditions' })
  async findAll(
    @Query('sort') sort: string,
    @Query('startAfter') startAfter?: string,
    @Query('limit') limit?: number,
    @Query('name') name?: string,
  ): Promise<AllNeedListsDto[]> {
    return await this.needListService.findAll(sort, startAfter, limit, name);
  }



  @Get(':id')
  @ApiOkResponse({ description: 'Successfully retrieved need list by ID.', type: [AllNeedListsDto] })
  @ApiInternalServerErrorResponse({
    description: 'Failed to retrieve need list by ID',
  })
  @ApiNotFoundResponse({ description: 'Need list not found' })
  async findOne(@Param('id') id: string): Promise<AllNeedListsDto> {
    return await this.needListService.findOne(id);
  }
}
