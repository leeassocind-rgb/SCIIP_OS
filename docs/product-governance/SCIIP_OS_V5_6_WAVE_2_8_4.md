# Wave 2.8.4 — Production Validation Data Externalization

The oversized `domain-production-validation` JavaScript chunk was caused by five large JSON datasets imported statically into React components.

Wave 2.8.4 moves those datasets to governed runtime assets under `public/production-validation-data`, adds a cached base-path-aware loader, and replaces static JSON imports with loading/error boundaries. The 1.5 MiB JavaScript chunk limit remains unchanged.
