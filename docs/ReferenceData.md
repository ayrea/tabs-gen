## Question:

I am designing a new API application which will be written in C#. The first endpoint will be used for Reference Data (i.e. used to drive drop-down lists in a UI that will eventually use the API). The back-end database is SQL. I am thinking of creating the two tables to store the reference data. The first table (tblReferenceType) will contain a list of the various reference data types. The second table (tblReferenceValue) will contain a FK of the value from the PK from tblReferenceType. Is this a valid database structure for storing reference data, of is there a better way to store reference data?

---

Yes — your proposed database structure is a perfectly valid approach, and it is a common pattern for storing reference data in a SQL database. It is often called a Reference Type / Reference Value pattern, or a lookup table pattern.

For a C# API that will supply drop-down lists to a UI, I would generally recommend this structure, with a few additions to make it robust and maintainable.

## 1. Recommended database structure

Your proposed design consists of two tables:

- `tblReferenceType` — defines the categories of reference data.
- `tblReferenceValue` — stores the individual values belonging to each category.

The relationship is one-to-many: each reference type can have multiple reference values.

## tblReferenceType

ReferenceTypeId

INT · Primary Key

PK

Code

VARCHAR · Unique

Name

NVARCHAR

One-to-many relationship

ReferenceTypeId → ReferenceTypeId

## tblReferenceValue

ReferenceValueId

INT · Primary Key

PK

ReferenceTypeId

INT · Foreign Key

FK

Code

VARCHAR

Name

NVARCHAR

SortOrder

INT

IsActive

BIT

For example, your reference types might be `Country`, `CustomerStatus`, and `PaymentMethod`. Each would have its own set of values in `tblReferenceValue`.

## 2. Example data

tblReferenceType

| ReferenceTypeId | Code              | Name            |
| --------------- | ----------------- | --------------- |
| 1               | `COUNTRY`         | Country         |
| 2               | `CUSTOMER_STATUS` | Customer Status |
| 3               | `PAYMENT_METHOD`  | Payment Method  |

tblReferenceValue

| ReferenceValueId | ReferenceTypeId | Code       | Name          | SortOrder | IsActive |
| ---------------- | --------------- | ---------- | ------------- | --------- | -------- |
| 1                | 1               | `AU`       | Australia     | 1         | 1        |
| 2                | 1               | `NZ`       | New Zealand   | 2         | 1        |
| 3                | 2               | `ACTIVE`   | Active        | 1         | 1        |
| 4                | 2               | `INACTIVE` | Inactive      | 2         | 1        |
| 5                | 3               | `CARD`     | Credit Card   | 1         | 1        |
| 6                | 3               | `BANK`     | Bank Transfer | 2         | 1        |

Notice that `ReferenceTypeId` determines which list each value belongs to.

A few design decisions here are particularly important:

- Code: Use a stable identifier such as `AU` or `ACTIVE`, rather than relying on the display name. Display names can change.
- SortOrder: Lets you control the order in which values appear in a drop-down.
- IsActive: Allows you to retire a value without deleting it from the database.
- Unique constraints: Ensure that a code cannot be duplicated within the same reference type.

## 3. Suggested SQL Server implementation

Assuming you are using SQL Server, I would start with the following schema.

sql

```

CREATE TABLE dbo.tblReferenceType
(
    ReferenceTypeId INT IDENTITY(1,1) NOT NULL,
    Code VARCHAR(100) NOT NULL,
    Name NVARCHAR(200) NOT NULL,

    CONSTRAINT PK_tblReferenceType
        PRIMARY KEY (ReferenceTypeId),

    CONSTRAINT UQ_tblReferenceType_Code
        UNIQUE (Code)
);
GO

CREATE TABLE dbo.tblReferenceValue
(
    ReferenceValueId INT IDENTITY(1,1) NOT NULL,
    ReferenceTypeId INT NOT NULL,
    Code VARCHAR(100) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,

    CONSTRAINT PK_tblReferenceValue
        PRIMARY KEY (ReferenceValueId),

    CONSTRAINT FK_tblReferenceValue_ReferenceType
        FOREIGN KEY (ReferenceTypeId)
        REFERENCES dbo.tblReferenceType (ReferenceTypeId),

    CONSTRAINT UQ_tblReferenceValue_Type_Code
        UNIQUE (ReferenceTypeId, Code)
);
GO
```

The composite unique constraint on `(ReferenceTypeId, Code)` means that `ACTIVE` can exist in different reference types if necessary, but cannot appear twice within the same type.

If you expect to audit changes, you could also add `CreatedDate`, `ModifiedDate`, and appropriate user identifiers. I would add these when the application's audit requirements justify them.

## 4. How this would work with your C# API

I would expose a reference-data endpoint that allows the UI to retrieve either all reference data or a specific list.

For example:

| HTTP method | Endpoint                                | Purpose                      |
| ----------- | --------------------------------------- | ---------------------------- |
| GET         | `/api/reference-data`                   | Retrieve all reference lists |
| GET         | `/api/reference-data/countries`         | Retrieve countries           |
| GET         | `/api/reference-data/customer-statuses` | Retrieve customer statuses   |

You could also expose `/api/reference-data/{typeCode}` for a generic implementation, rather than creating a separate controller action for every list.

A response for `/api/reference-data/countries` might look like this:

json

```
[
  {
    "id": 1,
    "code": "AU",
    "name": "Australia"
  },
  {
    "id": 2,
    "code": "NZ",
    "name": "New Zealand"
  }
]
```

In C#, I would use a simple DTO:

csharp

```
public sealed class ReferenceValueDto
{
    public int Id { get; init; }

    public string Code { get; init; } = string.Empty;

    public string Name { get; init; } = string.Empty;
}
```

The API can query `tblReferenceValue` by joining to `tblReferenceType` and filtering by the type's `Code`. It should normally return only active values, ordered by `SortOrder` and then `Name`.

For example, using SQL:

sql

```
SELECT
    rv.ReferenceValueId AS Id,
    rv.Code,
    rv.Name
FROM dbo.tblReferenceValue rv
INNER JOIN dbo.tblReferenceType rt
    ON rt.ReferenceTypeId = rv.ReferenceTypeId
WHERE rt.Code = @TypeCode
  AND rv.IsActive = 1
ORDER BY rv.SortOrder, rv.Name;
```

Use a parameterised query through your chosen data-access library, such as Entity Framework Core or Dapper.

### A small but important API design decision

I would generally keep the database's internal `ReferenceTypeId` out of public API routes. Using a stable type code such as `COUNTRY` makes the API easier to understand and avoids coupling clients to database-generated IDs.

For the individual values, however, returning an `id` can be useful when other tables store a foreign key to `tblReferenceValue`. You can return both `id` and `code` so that clients have a numeric identifier and a meaningful business code.

## 5. Is there a better alternative to two tables?

There are three common approaches. The best one depends on how dynamic your reference data needs to be.

### Option A — Two generic tables

My recommendation for your proposalOne table defines each reference type, and another stores its values.

Best for: Many lookup lists, centrally managed reference data, and a generic API endpoint.

Trade-off: Every value shares the same columns, so this is not ideal if different reference types need substantially different attributes.

### Option B — Separate lookup tables

Create tables such as `tblCountry`, `tblCustomerStatus`, and `tblPaymentMethod`.

Best for: Reference lists with different attributes, strong relational constraints, and domain-specific relationships.

Trade-off: More tables, queries, and API configuration. However, the schema is explicit and easier to enforce when the data has different rules.

### Option C — Hard-coded enums in C#

Represent a small, fixed set of values using C# enums or constants.

Best for: Values that are part of the application's business rules and are unlikely to change without a software release.

Trade-off: Non-developers cannot manage the values through the database, and changes may require a redeployment. Enums are not a replacement for all database-backed reference data.

For example, a country lookup is a good candidate for a database table. A small, fixed set of internal processing states might be better represented by an enum, depending on your domain model.

## 6. A few things I would consider before finalising the design

There are some details that can make a difference as the application grows.

- Prevent invalid references: Use foreign keys from business tables to the relevant lookup values. Where different lookup types share the same value table, ensure the application also verifies that a selected value belongs to the expected type. A simple foreign key to `ReferenceValueId` alone cannot enforce that type match.
- Retire values instead of deleting them: A value may already be referenced by existing records. Deactivating it preserves historical data while keeping it out of new drop-down selections.
- Cache reference data: These lists often change infrequently. Consider in-memory caching or distributed caching if the API will serve many users. Invalidate or expire the cache when values change.
- Don't use reference data for everything: If a lookup develops substantial business logic, complex relationships, or unique fields, give it a dedicated table and possibly a dedicated API resource.
- Consider permissions: If reference values are editable, keep administrative write operations separate from the read endpoints used by the UI.

## My recommendation

For your first API endpoint, I would proceed with your two-table design. It is a good starting point and should serve a reference-data API well.

I would use:

- `tblReferenceType` with a primary key and a unique, stable `Code`.
- `tblReferenceValue` with a primary key, a foreign key to the type, `Code`, `Name`, `SortOrder`, and `IsActive`.
- A generic C# endpoint such as `GET /api/reference-data/{typeCode}`.
- Dedicated lookup tables for reference types that eventually need their own attributes or stronger domain-specific constraints.

One final question that would influence my recommendation: Will reference data be maintained by administrators through the application, or will the values be relatively static and managed directly in SQL scripts or database deployments?

If administrators need to manage the lists dynamically, your two-table design becomes especially attractive. If everything is fixed and tightly controlled by the development team, separate lookup tables may be more appropriate for some of the lists.

---

## Follow up question:

I was thinking of adding an additional column to tblReferenceValue (ParentReferenceValueId). This column will act as the FK to the tblReferenceValue PK within the same table and allow for a parent/child reference data items. At this time I am only looking at parent/child functionally that is one level deep, however I think this design should also be able to support a large hierarchy. Is this a valid design, or should I consider a different design?

Yes — adding a `ParentReferenceValueId` column to `tblReferenceValue` is a valid design, and it is a well-established database pattern called an adjacency list or self-referencing hierarchy.

For your requirements, I would recommend this approach. It supports your immediate need for a single parent/child level while also allowing the hierarchy to grow to multiple levels in the future, without changing the table structure.

There are, however, a few important constraints I would add to make the design robust.

## 1. Recommended database structure

Your existing two-table design remains unchanged, with one additional nullable foreign key in `tblReferenceValue`.

### tblReferenceType

`ReferenceTypeId` — PK

`Code`, `Name`

One reference type has many values

### tblReferenceValue

`ReferenceValueId` — PK

`ReferenceTypeId` — FK

`ParentReferenceValueId` — nullable self-referencing FK

`Code`, `Name`, `SortOrder`, `IsActive`

ParentReferenceValueId references ReferenceValueId in the same table.

The important distinction is that `ParentReferenceValueId` is nullable:

- `NULL` means the value is a root-level item.
- A populated value identifies the item's parent.
- Multiple rows can reference the same parent, allowing any number of children.
- A child can itself become a parent, allowing multiple levels of hierarchy.

## 2. Example: How the hierarchy would work

Imagine you are building a UI that allows a user to select a product category and then a subcategory.

Electronics

ID: 100 · Parent: NULL

Root

Computers

ID: 101 · Parent: 100

Laptops

ID: 102 · Parent: 101

Desktops

ID: 103 · Parent: 101

Televisions

ID: 104 · Parent: 100

All these rows can belong to the same reference type, `PRODUCT_CATEGORY`.

Your original two-table structure still works. You do not need another table simply because you have introduced parent/child relationships.

## 3. SQL Server implementation

I would define the additional column and foreign key as follows:

sql

```
ALTER TABLE dbo.tblReferenceValue
ADD ParentReferenceValueId INT NULL;
GO

ALTER TABLE dbo.tblReferenceValue
ADD CONSTRAINT FK_tblReferenceValue_Parent
    FOREIGN KEY (ParentReferenceValueId)
    REFERENCES dbo.tblReferenceValue (ReferenceValueId);
GO

CREATE INDEX IX_tblReferenceValue_ParentReferenceValueId
ON dbo.tblReferenceValue (ParentReferenceValueId);
GO
```

This gives you referential integrity: a row cannot reference a parent that does not exist.

The index helps SQL Server find children when querying by parent, particularly as the table grows.

### An important limitation

The foreign key alone does not enforce all the rules you probably want.

For example, it does not prevent:

- A reference value from being its own parent.
- A child from belonging to a different reference type than its parent.
- A cycle such as A → B → C → A.
- A hierarchy from exceeding your application's permitted depth.

For the first version, I would enforce these rules in your service layer and, where appropriate, with additional database constraints.

If parent and child must always belong to the same reference type, you can enforce that with a composite foreign key.

For example, after ensuring the existing data is valid:

sql

```
ALTER TABLE dbo.tblReferenceValue
ADD CONSTRAINT UQ_tblReferenceValue_Id_Type
    UNIQUE (ReferenceValueId, ReferenceTypeId);
GO

ALTER TABLE dbo.tblReferenceValue
ADD CONSTRAINT FK_tblReferenceValue_Parent_Type
    FOREIGN KEY (ParentReferenceValueId, ReferenceTypeId)
    REFERENCES dbo.tblReferenceValue
        (ReferenceValueId, ReferenceTypeId);
GO
```

This composite constraint ensures the parent and child have the same `ReferenceTypeId`. It supplements the original self-referencing foreign key; it does not replace it.

The self-parent and cycle checks still require separate handling.

## 4. How to query the hierarchy

The right query depends on whether you want one level or the entire hierarchy.

### Option A: Retrieve immediate children

For your current one-level UI requirement, this is straightforward:

sql

```
SELECT
    ReferenceValueId,
    Code,
    Name,
    ParentReferenceValueId,
    SortOrder
FROM dbo.tblReferenceValue
WHERE ReferenceTypeId = @ReferenceTypeId
  AND ParentReferenceValueId = @ParentReferenceValueId
  AND IsActive = 1
ORDER BY SortOrder, Name;
```

When retrieving root-level items, pass `NULL` for the parent and use `IS NULL` in the query predicate instead of `= @ParentReferenceValueId`.

This approach works particularly well for cascading drop-down lists:

1. The UI retrieves root-level values.
2. The user selects a parent.
3. The UI requests the children of that parent.
4. The next drop-down is populated from the response.

### Option B: Retrieve the entire hierarchy

If you eventually need to return a complete hierarchy, SQL Server supports recursive common table expressions (CTEs).

sql

```
WITH ReferenceHierarchy AS
(
    SELECT
        ReferenceValueId,
        ReferenceTypeId,
        ParentReferenceValueId,
        Code,
        Name,
        SortOrder,
        0 AS HierarchyLevel
    FROM dbo.tblReferenceValue
    WHERE ReferenceTypeId = @ReferenceTypeId
      AND ParentReferenceValueId IS NULL

    UNION ALL

    SELECT
        child.ReferenceValueId,
        child.ReferenceTypeId,
        child.ParentReferenceValueId,
        child.Code,
        child.Name,
        child.SortOrder,
        parent.HierarchyLevel + 1
    FROM dbo.tblReferenceValue child
    INNER JOIN ReferenceHierarchy parent
        ON child.ParentReferenceValueId =
           parent.ReferenceValueId
    WHERE child.IsActive = 1
)
SELECT *
FROM ReferenceHierarchy
ORDER BY HierarchyLevel, SortOrder, Name
OPTION (MAXRECURSION 100);
```

This illustrates the general pattern, but there is one detail to correct for production use: the anchor should also filter for active values if inactive branches are not meant to appear, and the query needs a deliberate policy for inactive parents and their descendants.

`MAXRECURSION 100` limits runaway recursion; it is not a substitute for preventing cycles when data is written.

## 5. Is an adjacency list the best hierarchy model?

There are three common approaches worth knowing about.

| Approach                             | Best suited for                                                    | My assessment                                            |
| ------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------- |
| Self-referencing FK (adjacency list) | Parent/child relationships and hierarchies of variable depth       | Best fit for your current requirements                   |
| SQL Server `hierarchyid`             | Deep hierarchies where querying descendants and paths is important | Consider if hierarchical queries become a major workload |
| Closure table                        | Applications that frequently query all ancestors or descendants    | Usually unnecessary for simple reference data            |

The adjacency-list approach is simple to understand, easy to maintain, and flexible enough to support many levels. Its main trade-off is that querying an entire subtree requires recursion.

SQL Server's `hierarchyid` is worth considering for more advanced tree operations, but I would not introduce it just to support a parent/child drop-down.

A closure table stores each ancestor/descendant relationship separately. It can make certain queries easier, but it adds complexity whenever a node is inserted, moved, or deleted.

## 6. One final design consideration

There is an important difference between supporting multiple levels in the database and deciding how many levels your API allows.

You can support arbitrary depth in the schema while deliberately exposing only immediate children through your first API version. If requirements change later, you can add recursive retrieval without redesigning your tables.

My recommendation: Keep your two-table design, add the nullable `ParentReferenceValueId` self-referencing foreign key, enforce that parent and child share the same reference type, and use a recursive CTE only when you need to retrieve deeper hierarchies.

That gives you a simple solution today without unnecessarily limiting your options for the future.
