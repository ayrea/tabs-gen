import { useState, type ComponentType, type SyntheticEvent } from "react";
import { Box, MenuItem, Select, Tab, Tabs } from "@mui/material";

export type PageTabItem = {
  label: string;
  displayOrder: number;
  disabled?: boolean;
  Component: ComponentType;
  children?: PageTabItem[];
};

type PageTabsProps = {
  items: PageTabItem[];
};

function byDisplayOrder(items: PageTabItem[]) {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

function firstEnabledIndex(items: PageTabItem[]) {
  const index = items.findIndex((item) => !item.disabled);
  return index === -1 ? null : index;
}

function childIndexFor(parent: PageTabItem | undefined) {
  if (!parent?.children?.length) {
    return null;
  }
  return firstEnabledIndex(byDisplayOrder(parent.children));
}

export function PageTabs({ items }: PageTabsProps) {
  const sortedItems = byDisplayOrder(items);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedChildIndex, setSelectedChildIndex] = useState<number | null>(
    () => childIndexFor(byDisplayOrder(items)[0]),
  );

  const selectedParent = sortedItems[selectedIndex];
  const sortedChildren = selectedParent?.children?.length
    ? byDisplayOrder(selectedParent.children)
    : [];

  const selectParent = (index: number) => {
    setSelectedIndex(index);
    setSelectedChildIndex(childIndexFor(sortedItems[index]));
  };

  const handleParentChange = (_event: SyntheticEvent, newValue: number) => {
    selectParent(newValue);
  };

  const handleChildChange = (_event: SyntheticEvent, newValue: number) => {
    setSelectedChildIndex(newValue);
  };

  const ActivePage =
    sortedChildren.length > 0
      ? selectedChildIndex === null
        ? undefined
        : sortedChildren[selectedChildIndex]?.Component
      : selectedParent?.Component;

  const panelId =
    sortedChildren.length > 0
      ? `page-child-tabpanel-${selectedChildIndex}`
      : `page-tabpanel-${selectedIndex}`;
  const panelLabelledBy =
    sortedChildren.length > 0
      ? `page-child-tab-${selectedChildIndex}`
      : `page-tab-${selectedIndex}`;

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ display: { xs: "block", md: "none" }, px: 2, py: 1 }}>
          <Select
            value={selectedIndex}
            fullWidth
            aria-label="page tabs"
            onChange={(event) => selectParent(Number(event.target.value))}
          >
            {sortedItems.map((item, index) => (
              <MenuItem key={item.label} value={index} disabled={item.disabled}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          {sortedChildren.length > 0 && selectedChildIndex !== null && (
            <Select
              value={selectedChildIndex}
              fullWidth
              aria-label="child page tabs"
              onChange={(event) =>
                setSelectedChildIndex(Number(event.target.value))
              }
              sx={{ mt: 1 }}
            >
              {sortedChildren.map((item, index) => (
                <MenuItem
                  key={item.label}
                  value={index}
                  disabled={item.disabled}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          )}
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Tabs
            value={selectedIndex}
            onChange={handleParentChange}
            aria-label="page tabs"
            variant="scrollable"
            allowScrollButtonsMobile
          >
            {sortedItems.map((item, index) => (
              <Tab
                key={item.label}
                value={index}
                label={item.label}
                disabled={item.disabled}
                id={`page-tab-${index}`}
                aria-controls={`page-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>
      </Box>
      {sortedChildren.length > 0 && selectedChildIndex !== null && (
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            display: { xs: "none", md: "block" },
          }}
        >
          <Tabs
            value={selectedChildIndex}
            onChange={handleChildChange}
            aria-label="child page tabs"
            variant="scrollable"
            allowScrollButtonsMobile
          >
            {sortedChildren.map((item, index) => (
              <Tab
                key={item.label}
                value={index}
                label={item.label}
                disabled={item.disabled}
                id={`page-child-tab-${index}`}
                aria-controls={`page-child-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>
      )}
      <Box
        role="tabpanel"
        id={panelId}
        aria-labelledby={panelLabelledBy}
        sx={{ p: 2 }}
      >
        {ActivePage ? <ActivePage /> : null}
      </Box>
    </Box>
  );
}
