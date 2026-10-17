import { PageTabs } from "./components/PageTabs.tsx";
import { PersonDetails } from "./pages/personDetails/PersonDetails.tsx";
import { Addresses } from "./pages/addresses/Addresses.tsx";
import { PhoneNumbers } from "./pages/phoneNumbers/PhoneNumbers.tsx";
import { Pets } from "./pages/pets/Pets.tsx";
import { Hobbies } from "./pages/hobbies/Hobbies.tsx";
import { Photos } from "./pages/photos/Photos.tsx";

const pages = {
  personDetailsTab: { label: "Person Details", Component: PersonDetails },
  addressesTab: { label: "Addresses", Component: Addresses },
  phoneNumbersTab: { label: "Phone Numbers", Component: PhoneNumbers },
  petsTab: { label: "Pets", Component: Pets },
  hobbiesTab: { label: "Hobbies", Component: Hobbies },
  photosTab: { label: "Photos", Component: Photos },
};

export default function App() {
  return <PageTabs items={pages} />;
}
