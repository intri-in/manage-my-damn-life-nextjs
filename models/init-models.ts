import type { Sequelize } from "sequelize";
import { caldav_accounts as _caldav_accounts } from "./caldav_accounts";
import type { caldav_accountsAttributes, caldav_accountsCreationAttributes } from "./caldav_accounts";
import { calendar_events as _calendar_events } from "./calendar_events";
import type { calendar_eventsAttributes, calendar_eventsCreationAttributes } from "./calendar_events";
import { calendars as _calendars } from "./calendars";
import type { calendarsAttributes, calendarsCreationAttributes } from "./calendars";
import { custom_filters as _custom_filters } from "./custom_filters";
import type { custom_filtersAttributes, custom_filtersCreationAttributes } from "./custom_filters";
import { labels as _labels } from "./labels";
import type { labelsAttributes, labelsCreationAttributes } from "./labels";
import { otp_table as _otp_table } from "./otp_table";
import type { otp_tableAttributes, otp_tableCreationAttributes } from "./otp_table";
import { settings as _settings } from "./settings";
import type { settingsAttributes, settingsCreationAttributes } from "./settings";
import { ssid_table as _ssid_table } from "./ssid_table";
import type { ssid_tableAttributes, ssid_tableCreationAttributes } from "./ssid_table";
import { users as _users } from "./users";
import type { usersAttributes, usersCreationAttributes } from "./users";

export {
  _caldav_accounts as caldav_accounts,
  _calendar_events as calendar_events,
  _calendars as calendars,
  _custom_filters as custom_filters,
  _labels as labels,
  _otp_table as otp_table,
  _settings as settings,
  _ssid_table as ssid_table,
  _users as users,
};

export type {
  caldav_accountsAttributes,
  caldav_accountsCreationAttributes,
  calendar_eventsAttributes,
  calendar_eventsCreationAttributes,
  calendarsAttributes,
  calendarsCreationAttributes,
  custom_filtersAttributes,
  custom_filtersCreationAttributes,
  labelsAttributes,
  labelsCreationAttributes,
  otp_tableAttributes,
  otp_tableCreationAttributes,
  settingsAttributes,
  settingsCreationAttributes,
  ssid_tableAttributes,
  ssid_tableCreationAttributes,
  usersAttributes,
  usersCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const caldav_accounts = _caldav_accounts.initModel(sequelize);
  const calendar_events = _calendar_events.initModel(sequelize);
  const calendars = _calendars.initModel(sequelize);
  const custom_filters = _custom_filters.initModel(sequelize);
  const labels = _labels.initModel(sequelize);
  const otp_table = _otp_table.initModel(sequelize);
  const settings = _settings.initModel(sequelize);
  const ssid_table = _ssid_table.initModel(sequelize);
  const users = _users.initModel(sequelize);


  return {
    caldav_accounts: caldav_accounts,
    calendar_events: calendar_events,
    calendars: calendars,
    custom_filters: custom_filters,
    labels: labels,
    otp_table: otp_table,
    settings: settings,
    ssid_table: ssid_table,
    users: users,
  };
}
