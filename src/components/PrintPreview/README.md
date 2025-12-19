# PrintPreview Component

This component is responsible for rendering a printable view of a user's details. It displays various user information, including personal details, administrative information, problematics, and actions.

## Usage

Import the component from its new location:

```javascript
import PrintPreview from './components/PrintPreview/PrintPreview';
```

## Props

-   `user` (Object): The user object containing the data to be displayed.

## Structure

-   The component is organized into sections for different types of information:
    -   **Informations personnelles**: Displays basic user details.
    -   **Informations administratives**: Shows administrative information about the user.
    -   **Problématiques**: Lists the user's problematics.
    -   **Actions**: Displays a list of actions taken for the user.

## Notes

-   The component uses the `formatDate` function to format dates for display.
-   The `secteur` field has been added to the "Informations administratives" section.
