# Step 1: Amazon DynamoDB Setup

## Overview

Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability. In this project, it will store all task data for your application.

## Learning Objectives

- Create a DynamoDB table via AWS Console
- Understand primary keys and attributes
- Configure read/write capacity settings
- Test database operations

---

## Step-by-Step Instructions

### 1. Navigate to DynamoDB Service

1. Log in to your **AWS Management Console**
2. In the search bar at the top, type **DynamoDB**
3. Click on **DynamoDB** from the search results

### 2. Create a New Table

1. Click the **Create table** button (orange button on the right)
2. You'll see the "Create table" configuration page

### 3. Configure Table Settings

#### Basic Information

**Table name**: `TasksTable`

**Partition key (Primary Key)**:

- Attribute name: `task_id`
- Type: **String**

> **Why?** The partition key uniquely identifies each task. Using a string allows for flexible ID generation (UUIDs, timestamps, etc.)

#### Table Settings

**Table class**: Select **DynamoDB Standard**

**Capacity mode**: Choose one of the following:

##### Option A: On-Demand (Recommended for Learning)

- Select **On-demand**
- Pay per request (no capacity planning needed)
- Best for unpredictable workloads
- **Free tier note**: 25 WCU and 25 RCU included

##### Option B: Provisioned (For Cost Control)

- Select **Provisioned**
- Read capacity: `5` units
- Write capacity: `5` units
- Enable **Auto scaling** (optional but recommended)

> **For this project**: Use **On-demand** for simplicity during development and testing.

### 4. Additional Settings (Optional)

**Encryption at rest**: Keep the default (**Owned by Amazon DynamoDB**)

**Tags**: (Optional) Add tags for organization

- Key: `Project`
- Value: `TaskTracker`

### 5. Create the Table

1. Review your settings:
   - Table name: `TasksTable`
   - Partition key: `task_id` (String)
   - Capacity mode: On-demand

2. Click **Create table** button at the bottom

3. Wait 30-60 seconds for the table to be created
   - Status will change from "Creating" to **Active**

### 6. Verify Table Creation

1. You should see `TasksTable` in your tables list
2. Click on the table name to view details
3. Note the **Amazon Resource Name (ARN)** - you'll need this for Lambda permissions

**Example ARN**:
```
arn:aws:dynamodb:us-east-1:123456789012:table/TasksTable
```

---

## Understanding the Table Schema

While DynamoDB is schemaless, our application will use this structure:

| Attribute     | Type   | Required | Description                           |
|--------------|--------|----------|---------------------------------------|
| task_id      | String | Yes      | Primary key (UUID or unique string)   |
| user_id      | String | Yes      | Cognito user identifier               |
| task_name    | String | Yes      | Title of the task                     |
| description  | String | No       | Detailed task description             |
| status       | String | Yes      | "Pending" or "Completed"              |
| created_at   | String | Yes      | ISO timestamp (e.g., 2024-01-15T10:30:00Z) |

> **Note**: You don't need to define all attributes upfront in DynamoDB. Only the primary key is required during table creation.

---

## Test the Table (Manual Item Creation)

Let's add a test item to verify everything works:

### Add a Sample Item

1. In the DynamoDB console, select your `TasksTable`
2. Click on **Explore table items** button
3. Click **Create item**

#### Add Attributes

4. In the item editor:
   - `task_id` (String): `test-001`

5. Click **Add new attribute** and add:
   - Attribute name: `user_id` | Type: String | Value: `testuser123`

6. Add more attributes:
   - `task_name` (String): `Complete AWS Setup`
   - `description` (String): `Set up all AWS services for task tracker`
   - `status` (String): `Pending`
   - `created_at` (String): `2024-01-15T10:30:00Z`

7. Click **Create item**

### Verify the Item

1. You should see your test item in the items list
2. Try the **Scan** operation to return all items (button at top)
3. Verify all attributes display correctly

### Delete Test Item (Optional)

1. Select the test item checkbox
2. Click **Actions** → **Delete items**
3. Confirm deletion

---

## Set Up Global Secondary Index (Optional - Advanced)

If you want to query tasks by `user_id` efficiently:

### Create GSI

1. Go to your `TasksTable` → **Indexes** tab
2. Click **Create index**

**Index Configuration**:

- Partition key: `user_id` (String)
- Sort key: `created_at` (String) - optional, for sorting
- Index name: `UserIdIndex`
- Projected attributes: **All**

3. Click **Create index**
4. Wait for index to become **Active** (~5 minutes)

> **Why?** This allows efficient querying of all tasks for a specific user without scanning the entire table.

---

## Important Notes

### Security Considerations

- ✅ Never expose DynamoDB directly to the internet
- ✅ Always access through Lambda with proper IAM roles
- ✅ Use Cognito user IDs to ensure users only see their own tasks

### Cost Optimization

- 💰 On-demand pricing: $1.25 per million write requests, $0.25 per million read requests
- 💰 Free tier: 25GB storage + 25 WCU/RCU per month (provisioned mode)
- 💰 This project stays well within free tier limits for learning

### Troubleshooting

**Table creation failed?**

- Check IAM permissions (you need `dynamodb:CreateTable`)
- Ensure table name is unique in your region
- Verify you haven't exceeded account limits

**Can't see the table?**

- Check you're in the correct AWS region (top-right dropdown)
- Wait 60 seconds and refresh the page

---

## Checkpoint ✅

Before moving to the next step, ensure:

- ✅ `TasksTable` is created and showing **Active** status
- ✅ You understand the table schema structure
- ✅ You've noted the table ARN for later use
- ✅ (Optional) You tested creating and viewing an item

---

## Next Step

Continue to **[02-COGNITO-SETUP.md](./02-COGNITO-SETUP.md)** to set up user authentication.

---

## Additional Resources

- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [DynamoDB Pricing Calculator](https://aws.amazon.com/dynamodb/pricing/)
