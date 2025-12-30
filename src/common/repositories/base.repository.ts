import { Model, Types } from 'mongoose';

export class BaseRepository<TDocument> {
  protected model: Model<TDocument>;

  constructor(model: Model<TDocument>) {
    this.model = model;
  }

  async create(data: Partial<TDocument>): Promise<TDocument> {
    const doc = new this.model(data as any);
    return doc.save() as unknown as TDocument;
  }

  async findById(id: Types.ObjectId | string): Promise<TDocument | null> {
    return this.model.findById(id as any).exec();
  }

  async findOne(filter: any): Promise<TDocument | null> {
    return this.model.findOne(filter).exec();
  }

  async findMany(filter: any, projection?: any, options?: any): Promise<TDocument[]> {
    return this.model.find(filter, projection, options).exec();
  }

  async findByIdAndUpdate(id: Types.ObjectId | string, update: any, options = { new: true }): Promise<TDocument | null> {
    return this.model.findByIdAndUpdate(id as any, update, options).exec();
  }

  async findOneAndUpdate(filter: any, update: any, options = { new: true }): Promise<TDocument | null> {
    return this.model.findOneAndUpdate(filter, update, options).exec();
  }

  async deleteById(id: Types.ObjectId | string): Promise<TDocument | null> {
    return this.model.findByIdAndDelete(id as any).exec();
  }
}
