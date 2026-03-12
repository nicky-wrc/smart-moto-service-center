import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ForemanResponsesService } from './foreman-responses.service';
import { CreateForemanResponseDto } from './dto/create-foreman-response.dto';
import { UpdateForemanResponseDto } from './dto/update-foreman-response.dto';
import { QueryForemanResponseDto } from './dto/query-foreman-response.dto';
import { UpdateCustomerDecisionDto } from './dto/update-customer-decision.dto';

@ApiTags('Foreman Responses')
@Controller('foreman-responses')
export class ForemanResponsesController {
  constructor(
    private readonly foremanResponsesService: ForemanResponsesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new foreman response' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Foreman response created successfully',
  })
  create(@Body() createDto: CreateForemanResponseDto) {
    return this.foremanResponsesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all foreman responses with pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return list of foreman responses',
  })
  findAll(@Query() query: QueryForemanResponseDto) {
    return this.foremanResponsesService.findAll(query);
  }

  @Get('pending')
  @ApiOperation({
    summary: 'Get pending foreman responses (waiting for customer decision)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return pending foreman responses',
  })
  findPending() {
    return this.foremanResponsesService.findPending();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get foreman response statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return statistics',
  })
  getStats() {
    return this.foremanResponsesService.getStats();
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get foreman responses by job ID' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return foreman responses for the job',
  })
  findByJobId(@Param('jobId', ParseIntPipe) jobId: number) {
    return this.foremanResponsesService.findByJobId(jobId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single foreman response by ID' })
  @ApiParam({ name: 'id', description: 'Foreman Response ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the foreman response',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Foreman response not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.foremanResponsesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a foreman response' })
  @ApiParam({ name: 'id', description: 'Foreman Response ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Foreman response updated successfully',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateForemanResponseDto,
  ) {
    return this.foremanResponsesService.update(id, updateDto);
  }

  @Patch(':id/decision')
  @ApiOperation({ summary: 'Update customer decision (approve/reject)' })
  @ApiParam({ name: 'id', description: 'Foreman Response ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer decision updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Decision already made or invalid status',
  })
  updateCustomerDecision(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCustomerDecisionDto,
  ) {
    return this.foremanResponsesService.updateCustomerDecision(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a foreman response' })
  @ApiParam({ name: 'id', description: 'Foreman Response ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Foreman response deleted successfully',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.foremanResponsesService.remove(id);
  }
}
