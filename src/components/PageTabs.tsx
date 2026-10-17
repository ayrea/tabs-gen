import { useState, type ComponentType, type SyntheticEvent } from "react";
import { Box, MenuItem, Select, Tab, Tabs } from "@mui/material";

type PageTabItem = {
  label: string;
  Component: ComponentType;
};

type PageTabsProps = {
  items: Record<string, PageTabItem>;
};

export function PageTabs({ items }: PageTabsProps) {
  const ids = Object.keys(items);
  const [selectedId, setSelectedId] = useState(ids[0] ?? "");

  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    setSelectedId(newValue);
  };

  const ActivePage = items[selectedId]?.Component;

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ display: { xs: "block", md: "none" }, px: 2, py: 1 }}>
          <Select
            value={selectedId}
            fullWidth
            aria-label="page tabs"
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {ids.map((id) => (
              <MenuItem key={id} value={id}>
                {items[id].label}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Tabs
            value={selectedId}
            onChange={handleChange}
            aria-label="page tabs"
            variant="scrollable"
            allowScrollButtonsMobile
          >
            {ids.map((id) => (
              <Tab
                key={id}
                value={id}
                label={items[id].label}
                id={id}
                aria-controls={`${id}Panel`}
              />
            ))}
          </Tabs>
        </Box>
      </Box>
      <Box
        role="tabpanel"
        id={`page-tabpanel-${selectedId}`}
        aria-labelledby={`page-tab-${selectedId}`}
        sx={{ p: 2 }}
      >
        {ActivePage ? <ActivePage /> : null}
      </Box>
    </Box>
  );
}
