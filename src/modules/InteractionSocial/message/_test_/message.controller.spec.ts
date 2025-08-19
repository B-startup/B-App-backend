import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from '../message.controller';
import { MessageService } from '../message.service';
import { TokenBlacklistGuard } from '../../../../core/common/guards/token-blacklist.guard';

describe('MessageController', () => {
    let controller: MessageController;
    let service: MessageService;

    const mockMessageService = {
        sendMessage: jest.fn(),
        getDiscussionMessages: jest.fn(),
        getMessageById: jest.fn(),
        updateMessage: jest.fn(),
        deleteMessage: jest.fn(),
        searchMessages: jest.fn(),
        getUserRecentMessages: jest.fn(),
    };

    const mockUser1 = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'John Doe',
        email: 'john@example.com',
        profilePicture: 'john.jpg'
    };

    const mockMessageResponse = {
        id: '123e4567-e89b-12d3-a456-426614174100',
        discussionId: '123e4567-e89b-12d3-a456-426614174000',
        senderId: mockUser1.id,
        content: 'Hello, how are you?',
        createdAt: new Date('2023-12-01T10:00:00.000Z'),
        updatedAt: new Date('2023-12-01T10:00:00.000Z'),
        sender: mockUser1,
        discussion: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            type: 'PRIVATE',
            senderId: mockUser1.id,
            receiverId: '123e4567-e89b-12d3-a456-426614174002',
            projectId: null
        }
    };

    const mockTokenBlacklistGuard = {
        canActivate: jest.fn().mockReturnValue(true),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MessageController],
            providers: [
                {
                    provide: MessageService,
                    useValue: mockMessageService,
                },
            ],
        })
            .overrideGuard(TokenBlacklistGuard)
            .useValue(mockTokenBlacklistGuard)
            .compile();

        controller = module.get<MessageController>(MessageController);
        service = module.get<MessageService>(MessageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('sendMessage', () => {
        it('should send a message successfully', async () => {
            const createMessageDto = {
                discussionId: mockMessageResponse.discussionId,
                content: 'Hello, how are you?'
            };

            mockMessageService.sendMessage.mockResolvedValue(mockMessageResponse);

            const result = await controller.sendMessage(mockUser1.id, createMessageDto);

            expect(service.sendMessage).toHaveBeenCalledWith(mockUser1.id, createMessageDto);
            expect(result).toEqual(mockMessageResponse);
        });
    });

    describe('getDiscussionMessages', () => {
        it('should return paginated messages successfully', async () => {
            const paginatedResponse = {
                messages: [mockMessageResponse],
                pagination: {
                    page: 1,
                    limit: 50,
                    total: 1,
                    totalPages: 1
                }
            };

            mockMessageService.getDiscussionMessages.mockResolvedValue(paginatedResponse);

            const result = await controller.getDiscussionMessages(
                mockMessageResponse.discussionId,
                mockUser1.id,
                1,
                50
            );

            expect(service.getDiscussionMessages).toHaveBeenCalledWith(
                mockMessageResponse.discussionId,
                mockUser1.id,
                1,
                50
            );
            expect(result).toEqual(paginatedResponse);
        });
    });

    describe('getMessageById', () => {
        it('should return message by ID successfully', async () => {
            mockMessageService.getMessageById.mockResolvedValue(mockMessageResponse);

            const result = await controller.getMessageById(mockMessageResponse.id, mockUser1.id);

            expect(service.getMessageById).toHaveBeenCalledWith(mockMessageResponse.id, mockUser1.id);
            expect(result).toEqual(mockMessageResponse);
        });
    });

    describe('updateMessage', () => {
        it('should update message successfully', async () => {
            const updateMessageDto = {
                content: 'Updated message content'
            };

            const updatedResponse = {
                ...mockMessageResponse,
                content: updateMessageDto.content
            };

            mockMessageService.updateMessage.mockResolvedValue(updatedResponse);

            const result = await controller.updateMessage(
                mockMessageResponse.id,
                mockUser1.id,
                updateMessageDto
            );

            expect(service.updateMessage).toHaveBeenCalledWith(
                mockMessageResponse.id,
                mockUser1.id,
                updateMessageDto
            );
            expect(result).toEqual(updatedResponse);
        });
    });

    describe('deleteMessage', () => {
        it('should delete message successfully', async () => {
            mockMessageService.deleteMessage.mockResolvedValue(undefined);

            await controller.deleteMessage(mockMessageResponse.id, mockUser1.id);

            expect(service.deleteMessage).toHaveBeenCalledWith(mockMessageResponse.id, mockUser1.id);
        });
    });

    describe('searchMessages', () => {
        it('should search messages successfully', async () => {
            const query = 'hello';
            const messages = [mockMessageResponse];
            mockMessageService.searchMessages.mockResolvedValue(messages);

            const result = await controller.searchMessages(
                mockMessageResponse.discussionId,
                mockUser1.id,
                query
            );

            expect(service.searchMessages).toHaveBeenCalledWith(
                mockMessageResponse.discussionId,
                mockUser1.id,
                query
            );
            expect(result).toEqual(messages);
        });
    });

    describe('getUserRecentMessages', () => {
        it('should return user recent messages successfully', async () => {
            const messages = [mockMessageResponse];
            mockMessageService.getUserRecentMessages.mockResolvedValue(messages);

            const result = await controller.getUserRecentMessages(mockUser1.id, 20);

            expect(service.getUserRecentMessages).toHaveBeenCalledWith(mockUser1.id, 20);
            expect(result).toEqual(messages);
        });
    });
});
