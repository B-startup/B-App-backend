import { Injectable } from '@nestjs/common';
import { CreateUseOfFundDto } from './dto/create-use-of-fund.dto';
import { UpdateUseOfFundDto } from './dto/update-use-of-fund.dto';

@Injectable()
export class UseOfFundsService {
    create(createUseOfFundDto: CreateUseOfFundDto) {
        return 'This action adds a new useOfFund';
    }

    findAll() {
        return `This action returns all useOfFunds`;
    }

    findOne(id: number) {
        return `This action returns a #${id} useOfFund`;
    }

    update(id: number, updateUseOfFundDto: UpdateUseOfFundDto) {
        return `This action updates a #${id} useOfFund`;
    }

    remove(id: number) {
        return `This action removes a #${id} useOfFund`;
    }
}
