import { useState, type SyntheticEvent } from "react";
import { Box, MenuItem, Select, Tab, Tabs } from "@mui/material";
import { PersonDetails } from "./pages/personDetails/PersonDetails.tsx";
import { Addresses } from "./pages/addresses/Addresses.tsx";
import { PhoneNumbers } from "./pages/phoneNumbers/PhoneNumbers.tsx";
import { Pets } from "./pages/pets/Pets.tsx";
import { Hobbies } from "./pages/hobbies/Hobbies.tsx";
import { Photos } from "./pages/photos/Photos.tsx";

const pages = [
  { label: "Person Details", id: "personDetailsTab", Component: PersonDetails },
  { label: "Addresses", id: "addressesTab", Component: Addresses },
  { label: "Phone Numbers", id: "phoneNumbersTab", Component: PhoneNumbers },
  { label: "Pets", id: "petsTab", Component: Pets },
  { label: "Hobbies", id: "hobbiesTab", Component: Hobbies },
  { label: "Photos", id: "photosTab", Component: Photos },
];

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const ActivePage = pages[value]?.Component;

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ display: { xs: "block", md: "none" }, px: 2, py: 1 }}>
          <Select
            value={value}
            fullWidth
            aria-label="page tabs"
            onChange={(event) => setValue(Number(event.target.value))}
          >
            {pages.map((page, index) => (
              <MenuItem key={page.id} value={index}>
                {page.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="page tabs"
            variant="scrollable"
            allowScrollButtonsMobile
          >
            {pages.map((page) => (
              <Tab
                key={page.id}
                label={page.label}
                id={page.id}
                aria-controls={`${page.id}Panel`}
              />
            ))}
          </Tabs>
        </Box>
      </Box>
      <Box
        role="tabpanel"
        id={`page-tabpanel-${value}`}
        aria-labelledby={`page-tab-${value}`}
        sx={{ p: 2 }}
      >
        {ActivePage ? <ActivePage /> : null}
      </Box>
    </Box>
  );
}

export default App;
