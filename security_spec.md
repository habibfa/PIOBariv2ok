# PIOBARI Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Default Deny**: All unspecified paths under `/databases/{database}/documents` are denied for read and write.
2. **Public Review Schema Integrity (`/site_reviews/{reviewId}`)**:
   - Every review ID must match `^[a-zA-Z0-9_\-]+$` with length `<= 128`.
   - `authorName` is mandatory (non-anonymous), string `2..80` chars.
   - `role` is string `2..60` chars; `institution` is string `1..100` chars; `aspect` is string `2..80` chars.
   - `rating` is an integer strictly between `1` and `5`.
   - `comment` is string `3..1200` chars.
   - `tags` is a list of `0..5` strings (if non-empty, index 0 verified as string `<= 50` chars).
   - `createdAt` must equal `request.time` on create and remain strictly immutable on update.
   - `helpfulCount` must start at `0` on create and may only increment by `+1` during a helpful vote action.
   - `isPublic` must be `true` on create and immutable on public updates; `allow list` explicitly checks `resource.data.isPublic == true`.
   - `adminReplyText`, `adminRepliedBy`, `adminRepliedAt` cannot be set by public users on create or update — only by verified Admins (`isAdmin()`).
3. **Admin Access Control (`/admins/{userId}`)**:
   - Only verified Admin (`email == 'habibfa07@gmail.com' && email_verified == true` or existing `/admins/$(request.auth.uid)` doc) can read/manage admin records, reply to reviews, or delete reviews.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Shadow Field Injection on Create**: `{ ...validReview, isAdmin: true }` -> Blocked by `keys().hasOnly(...)`.
2. **Oversized Comment DoS**: `{ ...validReview, comment: "A".repeat(5000) }` -> Blocked by `comment.size() <= 1200`.
3. **Anonymous / Empty Author**: `{ ...validReview, authorName: "" }` -> Blocked by `authorName.size() >= 2`.
4. **Out-of-Range Rating**: `{ ...validReview, rating: 99 }` -> Blocked by `rating >= 1 && rating <= 5`.
5. **Client-Forged Timestamp**: `{ ...validReview, createdAt: Timestamp(2020-01-01) }` -> Blocked by `createdAt == request.time`.
6. **Inflated Initial Helpful Count**: `{ ...validReview, helpfulCount: 9999 }` -> Blocked by `helpfulCount == 0`.
7. **Unbounded Tags Array**: `{ ...validReview, tags: ["a","b","c","d","e","f"] }` -> Blocked by `tags.size() <= 5`.
8. **ID Poisoning Attack**: Document ID `"../admin/" + "x".repeat(500)` -> Blocked by `isValidId(reviewId)`.
9. **Spoofed Admin Reply on Create**: `{ ...validReview, adminReplyText: "Fake official reply" }` -> Blocked by `keys().hasOnly(...)` on create.
10. **Unauthorized Comment Tampering on Update**: Updating `comment` or `rating` without `isAdmin()` -> Blocked by `affectedKeys().hasOnly(['helpfulCount'])`.
11. **Helpful Count Manipulation**: Updating `helpfulCount` by `+10` instead of `+1` -> Blocked by `incoming().helpfulCount == existing().helpfulCount + 1`.
12. **Unverified Admin Email Spoof**: Auth token with `email == 'habibfa07@gmail.com'` and `email_verified == false` attempting `delete` -> Blocked by `request.auth.token.email_verified == true`.
