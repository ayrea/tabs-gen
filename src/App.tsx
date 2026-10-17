import { useState, type SyntheticEvent } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { PersonDetails } from "./pages/personDetails/PersonDetails.tsx";
import { Addresses } from "./pages/addresses/Addresses.tsx";
import { PhoneNumbers } from "./pages/phoneNumbers/PhoneNumbers.tsx";
import { Pets } from "./pages/pets/Pets.tsx";
import { Hobbies } from "./pages/hobbies/Hobbies.tsx";
import { Photos } from "./pages/photos/Photos.tsx";

const pages = [PersonDetails, Addresses, PhoneNumbers, Pets, Hobbies, Photos];

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const ActivePage = pages[value];

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="page tabs">
          <Tab
            label="Person Details"
            id="personDetailsTab"
            aria-controls="personDetailsTabPanel"
          />
          <Tab
            label="Addresses"
            id="addressesTab"
            aria-controls="addressesTabPanel"
          />
          <Tab
            label="Phone Numbers"
            id="phoneNumbersTab"
            aria-controls="phoneNumbersTabPanel"
          />
          <Tab label="Pets" id="petsTab" aria-controls="petsTabPanel" />
          <Tab
            label="Hobbies"
            id="hobbiesTab"
            aria-controls="hobbiesTabPanel"
          />
          <Tab label="Photos" id="photosTab" aria-controls="photosTabPanel" />
        </Tabs>
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
