import { useState, type ComponentType, type SyntheticEvent } from "react";
import { Box, MenuItem, Select, Tab, Tabs } from "@mui/material";

type PageTabItem = {
  label: string;
  Component: ComponentType;
};

type PageTabsProps = {
  items: PageTabItem[];
};

export function PageTabs({ items }: PageTabsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setSelectedIndex(newValue);
  };

  const ActivePage = items[selectedIndex]?.Component;

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ display: { xs: "block", md: "none" }, px: 2, py: 1 }}>
          <Select
            value={selectedIndex}
            fullWidth
            aria-label="page tabs"
            onChange={(event) => setSelectedIndex(Number(event.target.value))}
          >
            {items.map((item, index) => (
              <MenuItem key={item.label} value={index}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Tabs
            value={selectedIndex}
            onChange={handleChange}
            aria-label="page tabs"
            variant="scrollable"
            allowScrollButtonsMobile
          >
            {items.map((item, index) => (
              <Tab
                key={item.label}
                value={index}
                label={item.label}
                id={`page-tab-${index}`}
                aria-controls={`page-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>
      </Box>
      <Box
        role="tabpanel"
        id={`page-tabpanel-${selectedIndex}`}
        aria-labelledby={`page-tab-${selectedIndex}`}
        sx={{ p: 2 }}
      >
        {ActivePage ? <ActivePage /> : null}
      </Box>
    </Box>
  );
}
