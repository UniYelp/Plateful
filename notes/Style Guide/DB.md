### General Guidelines
- **Avoid booleans for state actions.** 
  Instead of `isDeleted`, `isActive`, etc., prefer **dates** that indicate when the state was applied.
  ```ts
	type Table = {
		// ✅ Preferred
		deletedAt: number | string /** Date */,
		// ❌ Avoid
		isDeleted: boolean,
	}
    ```
- **Date columns:**
	- Prefer storing dates as **numbers** (e.g., UNIX timestamps).
	- If using SQL, **timestamps with timezones** are acceptable.
	- **Always store in UTC+0**, never local time.
	  ```sql
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC'
		```
- **Standard columns:**
  Always include the following columns in every entity, even if some are not used immediately

| Column      | Type             | Notes                              |
| ----------- | ---------------- | ---------------------------------- |
| `id`        | `Uuid`           | Primary key                        |
| `createdAt` | `Date`           | Creation time                      |
| `updatedAt` | `Date`           | Last update time                   |
| `deletedAt` | `Date` \| `null` | Soft deletion time                 |
| `createdBy` | `string`         | User or "system" that created      |
| `updatedBy` | `string`         | User or "system" that last updated |
	* If `deletedAt` has a value, then `updatedBy` is also `deletedBy`.
- **Enums in DB:**
	- Prefer **string columns** with **application validation and fallback** logic rather than strict SQL enums.
	- This improves **migrations, flexibility, and forward compatibility**.
