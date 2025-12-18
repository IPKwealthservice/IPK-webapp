# Client Code Implementation Guide

This document provides complete backend implementation instructions for adding the `clientCode` field to the `IpkLeadd` model.

## Overview

The `clientCode` field is an optional string field that stores the client code assigned when a lead's stage changes to `ACCOUNT_OPENED`. This code is displayed prominently in the lead profile header.

## Backend Implementation Steps

### 1. Prisma Schema Update

Update your `schema.prisma` file to add the `clientCode` field:

```prisma
model IpkLeadd {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  leadCode      String?  @unique
  clientCode    String?  // Add this line
  firstName     String?
  lastName      String?
  // ... other fields
  
  @@index([clientCode]) // Add index for better query performance
  @@map("ipk_leadds")
}
```

### 2. Generate Prisma Migration

Run the following command to create a migration:

```bash
npx prisma migrate dev --name add_client_code_to_ipk_leadd
```

Or if using Prisma Migrate:

```bash
npx prisma migrate dev --create-only --name add_client_code_to_ipk_leadd
```

This will create a migration file. Review it to ensure it looks correct, then apply it:

```bash
npx prisma migrate deploy
```

### 3. Update Entity File

Update your entity file (e.g., `ipk-leadd.entity.ts` or similar):

```typescript
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'ipk_leadds', timestamps: true })
@ObjectType()
export class IpkLeadd extends Document {
  @Field(() => ID)
  id: string;

  @Prop({ type: String, unique: true, sparse: true })
  @Field(() => String, { nullable: true })
  leadCode?: string;

  @Prop({ type: String, index: true }) // Add this
  @Field(() => String, { nullable: true }) // Add this
  clientCode?: string; // Add this

  // ... other fields
}

export const IpkLeaddSchema = SchemaFactory.createForClass(IpkLeadd);
```

### 4. Update DTOs

#### CreateLeadDto (create-ipk-leadd.dto.ts)

```typescript
import { IsString, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateIpkLeaddInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  clientCode?: string;

  // ... other fields
}
```

#### UpdateLeadDto (update-lead-details.dto.ts)

```typescript
import { IsString, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateLeadDetailsInput {
  @Field(() => ID)
  leadId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  clientCode?: string;

  // ... other fields
}
```

### 5. Update Service Methods

#### Create Method (ipk-leadd.service.ts)

```typescript
async createIpkLeadd(input: CreateIpkLeaddInput): Promise<IpkLeadd> {
  const lead = new this.ipkLeaddModel({
    ...input,
    clientCode: input.clientCode || undefined, // Store only if provided
  });
  return lead.save();
}
```

#### Update Method (ipk-leadd.service.ts)

```typescript
async updateLeadDetails(input: UpdateLeadDetailsInput): Promise<IpkLeadd> {
  const { leadId, ...updateData } = input;
  
  // Remove undefined values
  const cleanData = Object.fromEntries(
    Object.entries(updateData).filter(([_, v]) => v !== undefined)
  );

  const updated = await this.ipkLeaddModel.findByIdAndUpdate(
    leadId,
    { $set: cleanData },
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new NotFoundException(`Lead with ID ${leadId} not found`);
  }

  return updated;
}
```

### 6. Update GraphQL Schema/Resolvers

Ensure your GraphQL schema includes `clientCode` in the `IpkLeadd` type:

```graphql
type IpkLeaddEntity {
  id: ID!
  leadCode: String
  clientCode: String  # Add this
  firstName: String
  lastName: String
  # ... other fields
}

input UpdateLeadDetailsInput {
  leadId: ID!
  clientCode: String  # Add this
  # ... other fields
}

input CreateIpkLeaddInput {
  clientCode: String  # Add this (optional)
  # ... other fields
}
```

### 7. Resolver Updates

#### updateLeadDetails Resolver

```typescript
@Mutation(() => IpkLeaddEntity)
async updateLeadDetails(
  @Args('input') input: UpdateLeadDetailsInput,
): Promise<IpkLeadd> {
  return this.ipkLeaddService.updateLeadDetails(input);
}
```

### 8. Indexing

The Prisma schema already includes an index on `clientCode`. If you need to add it manually in MongoDB:

```javascript
db.ipk_leadds.createIndex({ clientCode: 1 });
```

### 9. Validation (Optional but Recommended)

Add validation in your service or use a custom validator:

```typescript
// In your service or DTO
@IsOptional()
@IsString()
@Matches(/^[A-Za-z0-9_-]+$/, {
  message: 'Client code can only contain letters, numbers, hyphens, and underscores',
})
clientCode?: string;
```

## Database Migration Script (Alternative)

If you prefer a manual migration script:

```typescript
// scripts/add-client-code-field.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // The field will be added automatically by Prisma
  // This script can be used to set default values or migrate existing data if needed
  
  console.log('Client code field migration completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Testing Checklist

- [ ] Prisma migration runs successfully
- [ ] `clientCode` field is nullable in database
- [ ] Index is created on `clientCode`
- [ ] Create lead with `clientCode` works
- [ ] Create lead without `clientCode` works (should be null)
- [ ] Update lead to set `clientCode` works
- [ ] Update lead to remove `clientCode` works (set to null)
- [ ] GraphQL query returns `clientCode` field
- [ ] GraphQL mutation accepts `clientCode` in input
- [ ] Validation rejects invalid `clientCode` formats (if implemented)

## Example GraphQL Mutations

### Create Lead with Client Code
```graphql
mutation CreateLead($input: CreateIpkLeaddInput!) {
  createIpkLeadd(input: $input) {
    id
    leadCode
    clientCode
    name
  }
}
```

Variables:
```json
{
  "input": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "clientCode": "BNR62025"
  }
}
```

### Update Lead Client Code
```graphql
mutation UpdateLeadDetails($input: UpdateLeadDetailsInput!) {
  updateLeadDetails(input: $input) {
    id
    clientCode
    leadCode
    name
  }
}
```

Variables:
```json
{
  "input": {
    "leadId": "6922cc64771efe8345cdc75a",
    "clientCode": "BNR62025"
  }
}
```

## Notes

1. **Optional Field**: `clientCode` is optional and can be null. It's only required when the lead stage is `ACCOUNT_OPENED`.

2. **Indexing**: The index on `clientCode` helps with queries but is optional. Consider your query patterns.

3. **Validation**: The frontend validates the format (alphanumeric, hyphens, underscores), but backend validation is recommended for security.

4. **Migration Safety**: Since this is a new optional field, the migration is safe and won't affect existing data.

5. **GraphQL Schema**: Ensure your GraphQL schema is regenerated after Prisma schema changes if you're using code generation.

## Frontend Integration

The frontend is already updated to:
- Display `clientCode` in the lead profile header
- Show a modal when switching to `ACCOUNT_OPENED` stage
- Include `clientCode` in all relevant GraphQL queries and mutations

Ensure your backend GraphQL schema matches the frontend expectations.



