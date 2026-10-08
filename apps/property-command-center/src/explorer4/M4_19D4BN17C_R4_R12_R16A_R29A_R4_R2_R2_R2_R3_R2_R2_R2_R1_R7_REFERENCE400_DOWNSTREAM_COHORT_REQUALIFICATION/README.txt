R1-R7 consumes the exact recertified Reference-400 produced by R1-R6 and performs the downstream cohort requalification needed to resume R29.

The milestone:
- revalidates/bootstraps the SCIIP runtime,
- verifies CDP,
- creates a fresh app page with PUT /json/new,
- reads the live Explorer inventory,
- excludes all 400 Reference-400 members,
- preserves canonical live order,
- selects the next exact 400 unique candidates,
- certifies exact Reference-400 + New-400 = 800 unique records.

No property click, Assignments, Generate, Export, governed-data mutation, or application-source mutation occurs.
