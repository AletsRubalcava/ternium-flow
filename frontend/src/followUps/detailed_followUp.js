import { getAppContext } from "../shared/app_context.js";
import { renderHeader } from "../shared/components/header.js";
import { setActiveNav } from "../shared/utils/nav.js";
import { navIds } from "../shared/constants/navigation.js";

const context = getAppContext();
renderHeader(context);
setActiveNav(navIds.followUps);