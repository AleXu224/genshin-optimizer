import { Box, Grid, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/system"
import ReactGA from 'react-ga4'
import InventoryCard from "./InventoryCard"
import ResinCard from "./ResinCard"

export default function PageHome() {
  // TODO: translations
  // const { t } = useTranslation("page_home")
  const theme = useTheme();
  const lg = useMediaQuery(theme.breakpoints.up('lg'));
  ReactGA.send({ hitType: "pageview", page: '/home' })
  if (lg) return <Grid container spacing={2} direction={"row-reverse"} sx={{ my: 2 }}>
    <Grid item xs={12} lg={5} xl={4} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <ResinCard />
    </Grid>
    <Grid item xs={12} lg={7} xl={8} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <InventoryCard />
    </Grid>

  </Grid>
  return (
    <Box my={1} display="flex" flexDirection="column" gap={1}>
      <InventoryCard />
      <ResinCard />
    </Box>
  );
}
