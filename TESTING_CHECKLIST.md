# Testing Checklist

## ✅ Manual Testing Checklist

### 1. Selection Interface Testing

#### Inspiration Selection
- [ ] Click on each inspiration option
- [ ] Verify selection state changes (border highlight)
- [ ] Select multiple inspirations
- [ ] Deselect by clicking again
- [ ] Verify summary card updates correctly
- [ ] Test on mobile viewport

#### Product Type Selection
- [ ] Test each product category (Decor, Kitchenware, Apparel, etc.)
- [ ] Select multiple product types
- [ ] Verify selection state changes
- [ ] Deselect by clicking again
- [ ] Verify summary card updates correctly
- [ ] Test scrolling through all categories

#### Color Scheme Selection
- [ ] Click on each color palette
- [ ] Verify color circles display correctly
- [ ] Select multiple color schemes
- [ ] Deselect by clicking again
- [ ] Verify summary card updates correctly

#### Design Concept Selection
- [ ] Click on each design concept
- [ ] Select multiple concepts
- [ ] Verify selection state changes
- [ ] Deselect by clicking again
- [ ] Verify summary card updates correctly

### 2. Summary Card Testing

- [ ] Verify summary card shows "No selections yet" when empty
- [ ] Verify each category appears in summary when selected
- [ ] Test "Clear All" button functionality
- [ ] Verify "Clear All" button only shows when selections exist
- [ ] Verify badges display correctly for each selection
- [ ] Test summary card on mobile viewport

### 3. Generation Features Testing

#### PNG Generation (Requires LOVABLE_API_KEY)
- [ ] Select at least one option from any category
- [ ] Click "Generate PNG on Transparent Background"
- [ ] Verify loading state shows "Generating..."
- [ ] Verify toast notification: "Generating design image..."
- [ ] Verify toast notification: "Removing background..."
- [ ] Verify success toast: "PNG with transparent background generated!"
- [ ] Verify dialog opens with generated image
- [ ] Verify image displays correctly
- [ ] Test "Download PNG" button
- [ ] Verify downloaded file is PNG format
- [ ] Verify background is transparent
- [ ] Close dialog and verify it closes properly

#### Listing Generation (Requires LOVABLE_API_KEY)
- [ ] Select at least one option from any category
- [ ] Click "Generate Listing"
- [ ] Verify loading state shows "Generating..."
- [ ] Verify success toast: "Listing generated successfully!"
- [ ] Verify dialog opens with generated listing
- [ ] Verify title is displayed
- [ ] Verify description is displayed
- [ ] Verify features list is displayed
- [ ] Verify tags are displayed as badges
- [ ] Verify price range is displayed
- [ ] Close dialog and verify it closes properly

#### Export Functionality
- [ ] Make some selections
- [ ] Generate a PNG (optional)
- [ ] Generate a listing (optional)
- [ ] Click "Export Full Listing"
- [ ] Verify success toast: "Listing exported successfully!"
- [ ] Verify JSON file downloads
- [ ] Open JSON file and verify structure
- [ ] Verify all selections are included
- [ ] Verify timestamp is included
- [ ] Verify generated image URL is included (if generated)
- [ ] Verify generated listing is included (if generated)

### 4. Error Handling Testing

#### API Errors
- [ ] Test with invalid/missing LOVABLE_API_KEY
- [ ] Verify error toast displays
- [ ] Verify error message is user-friendly
- [ ] Test with rate limit exceeded (if possible)
- [ ] Test with insufficient credits (if possible)

#### Network Errors
- [ ] Disconnect internet and try generating
- [ ] Verify error handling
- [ ] Reconnect and verify recovery

#### Background Removal Errors
- [ ] Test with very large images (if possible)
- [ ] Verify error handling
- [ ] Verify user feedback

### 5. UI/UX Testing

#### Responsive Design
- [ ] Test on mobile (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1024px+ width)
- [ ] Test on large desktop (1920px+ width)
- [ ] Verify all elements are accessible
- [ ] Verify no horizontal scrolling
- [ ] Verify touch targets are adequate on mobile

#### Accessibility
- [ ] Test keyboard navigation
- [ ] Tab through all interactive elements
- [ ] Verify focus indicators are visible
- [ ] Test with screen reader (if available)
- [ ] Verify color contrast is adequate
- [ ] Verify all images have alt text

#### Performance
- [ ] Measure initial page load time
- [ ] Verify smooth scrolling
- [ ] Test selection interactions (should be instant)
- [ ] Monitor memory usage during background removal
- [ ] Test with browser DevTools Performance tab

### 6. Browser Compatibility Testing

#### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Firefox Mobile
- [ ] Samsung Internet

#### Features to Test Per Browser
- [ ] Selection interface works
- [ ] Dialogs open and close
- [ ] Images display correctly
- [ ] Downloads work
- [ ] Background removal works (WebGPU support)
- [ ] Toast notifications appear

### 7. Edge Cases Testing

#### Empty States
- [ ] Test with no selections made
- [ ] Verify action buttons don't appear
- [ ] Verify summary shows empty state message

#### Maximum Selections
- [ ] Select all options in all categories
- [ ] Verify UI handles many selections
- [ ] Verify summary card scrolls if needed
- [ ] Test generation with maximum selections

#### Rapid Interactions
- [ ] Rapidly click selection cards
- [ ] Rapidly click generate buttons
- [ ] Verify no duplicate requests
- [ ] Verify UI state remains consistent

#### Dialog Interactions
- [ ] Open image dialog, close, reopen
- [ ] Open listing dialog, close, reopen
- [ ] Click outside dialog to close
- [ ] Press Escape to close dialog
- [ ] Test with multiple dialogs (shouldn't be possible, but verify)

### 8. Data Persistence Testing

#### Session Storage
- [ ] Make selections
- [ ] Refresh page
- [ ] Verify selections are lost (expected behavior)
- [ ] Consider if persistence is desired

#### Generated Content
- [ ] Generate PNG
- [ ] Verify image URL persists in state
- [ ] Generate listing
- [ ] Verify listing persists in state
- [ ] Close and reopen dialogs
- [ ] Verify content still displays

### 9. Integration Testing

#### Supabase Connection
- [ ] Verify Supabase client initializes
- [ ] Test edge function invocation
- [ ] Verify CORS headers work
- [ ] Test with valid credentials
- [ ] Test with invalid credentials

#### AI Generation
- [ ] Test with various selection combinations
- [ ] Verify prompt construction
- [ ] Verify image quality
- [ ] Verify listing quality
- [ ] Test with minimal selections
- [ ] Test with maximum selections

### 10. Security Testing

#### Input Validation
- [ ] Verify selections are validated
- [ ] Test with unexpected input (if possible)
- [ ] Verify no XSS vulnerabilities

#### API Security
- [ ] Verify API keys are not exposed in client
- [ ] Verify edge functions use proper authentication
- [ ] Test CORS configuration

## 🔧 Automated Testing (Future)

### Unit Tests Needed
- [ ] Selection state management
- [ ] Background removal utility
- [ ] Export functionality
- [ ] Dialog state management

### Integration Tests Needed
- [ ] Complete design generation flow
- [ ] Selection to export flow
- [ ] Error handling flows

### E2E Tests Needed
- [ ] Full user journey
- [ ] Multi-device testing
- [ ] Performance benchmarks

## 📊 Performance Benchmarks

### Target Metrics
- [ ] Initial page load: < 3 seconds
- [ ] Selection interaction: < 100ms
- [ ] Background removal: < 10 seconds
- [ ] PNG generation: < 30 seconds (depends on API)
- [ ] Listing generation: < 10 seconds (depends on API)

### Actual Metrics (To Be Measured)
- Initial page load: _____ seconds
- Selection interaction: _____ ms
- Background removal: _____ seconds
- PNG generation: _____ seconds
- Listing generation: _____ seconds

## 🐛 Known Issues Log

### Critical Issues
- None identified

### Major Issues
- None identified

### Minor Issues
- 7 ESLint warnings (fast-refresh in UI components - non-blocking)

### Enhancement Requests
- See IMPROVEMENTS.md for detailed list

## ✅ Sign-Off

### Development Testing
- [ ] All manual tests passed
- [ ] No critical bugs found
- [ ] Performance acceptable
- [ ] Ready for staging

### Staging Testing
- [ ] All features work in staging
- [ ] No regressions found
- [ ] Performance acceptable
- [ ] Ready for production

### Production Testing
- [ ] Smoke tests passed
- [ ] Monitoring in place
- [ ] Rollback plan ready
- [ ] Production verified

---

**Testing Date**: _____________

**Tested By**: _____________

**Environment**: _____________

**Notes**: _____________