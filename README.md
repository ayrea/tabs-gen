# tabs-gen

tabs-gen is an example of data-driven tab navigation. The pages, their order, and which ones are disabled come from a list in `src/pagesConfig.ts`. `PageTabs` reads that list and renders the navigation and the selected page.

Tabs can be two levels deep. The top ribbon is the parent pages. When the selected parent has child pages, a second ribbon appears underneath it, and the page shown is the selected child. Choosing a parent selects its first child that is not disabled. A parent with no children has no second ribbon, and its own page is shown.

The layout is responsive. At 900px and wider, each level is a scrollable tab ribbon. Arrow buttons appear at the ends of a ribbon when its tabs do not fit. Below 900px, each ribbon is replaced by a dropdown. A second dropdown is shown only when the selected parent has children. Disabled pages stay visible and cannot be selected in either layout.

```bash
npm install
npm run dev
```
