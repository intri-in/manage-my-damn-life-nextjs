import AppBarGeneric from "@/components/common/AppBar";
import { Loading } from "@/components/common/Loading"
import AddFilter from "@/components/filters/AddFilter";
import { Toastify } from "@/components/Generic";
import { getRandomString } from "@/helpers/crypto";
import { FilterHelper } from "@/helpers/frontend/classes/FilterHelper";
import { filtertoWords, getFiltersFromServer } from "@/helpers/frontend/filters";
import { getI18nObject } from "@/helpers/frontend/general";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { isDarkModeEnabled } from "@/helpers/frontend/theme";
import { dateTimeReviver } from "@/helpers/general";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageFilters = () => {
  const i18next = getI18nObject();
  const router = useRouter();
  const [addFilterForm, setAddFilterForm] = useState(<></>);
  const [filterList, setFilterList] = useState([<Loading />]);

  useEffect(() => {
    setAddFilterForm(
      <div style={{ textAlign: "right" }}>
        <Button onClick={handleAddFilterButtonClick}>
          {i18next.t("ADD_NEW_FILTER")}
        </Button>
      </div>
    );
    generateFilterList();
  }, []);

  const generateFilterList = async () => {
    const filtersFromServer = await getFiltersFromServer();
    const finalOutput: JSX.Element[] = [];
    if (
      filtersFromServer &&
      filtersFromServer.success &&
      filtersFromServer.data &&
      Array.isArray(filtersFromServer.data.message)
    ) {
      const borderColor = isDarkModeEnabled() ? "white" : "#F1F1F1";
      filtersFromServer.data.message.forEach((filter, i) => {
        const jsonFilter = JSON.parse(filter.filtervalue);
        finalOutput.push(
          <div
            className="card"
            key={`${i}_filterName`}
            style={{
              border: `1px solid ${borderColor}`,
              padding: 20,
              marginBottom: 20,
              borderRadius: 20,
            }}
          >
            <Row>
              <Col>
                <h3>{filter.name}</h3>
                <p
                  key={`${i}_${filter.name}`}
                  className="textDefault"
                >
                  {filtertoWords(jsonFilter)}
                </p>
              </Col>
              <Col style={{ textAlign: "right" }}>
                <AiOutlineEdit
                  key={`${i}_words_${getRandomString(6)}`}
                  onClick={() => handleEditFilterButtonClick(filter)}
                  color="red"
                />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <AiOutlineDelete
                  onClick={() => handleDeleteButtonClick(filter.custom_filters_id)}
                  color="red"
                />
              </Col>
            </Row>
          </div>
        );
      });
    } else {
      const message = getMessageFromAPIResponse(filtersFromServer);
      console.error("generateFilterList", message, filtersFromServer);
      if (message) {
        toast.error(i18next.t(message));
      } else {
        toast.error(i18next.t("ERROR_GENERIC"));
      }
    }
    setFilterList(
      finalOutput.length > 0 ? finalOutput : [<p>{i18next.t("NO_FILTERS_TO_SHOW")}</p>]
    );
  };

  const handleAddFilterButtonClick = () => {
    setAddFilterForm(<AddFilter onAdd={handleAddNewFilter} />);
  };

  const handleEditFilterButtonClick = (filter) => {
    setAddFilterForm(
      <AddFilter
        filterName={filter.name}
        filter={JSON.parse(filter.filtervalue, dateTimeReviver)}
        filterid={filter.custom_filters_id}
        mode="edit"
        onAdd={handleAddNewFilter}
      />
    );
  };

  const handleAddNewFilter = (response) => {
    generateFilterList();
    if (response) {
      toast.success(i18next.t("FILTER_INSERT_OK"));
    }
    setAddFilterForm(
      <div style={{ textAlign: "right" }}>
        <Button onClick={handleAddFilterButtonClick}>
          {i18next.t("ADD_NEW_FILTER")}
        </Button>
      </div>
    );
  };

  const handleDeleteButtonClick = async (filterid) => {
    const deleteResponse = await FilterHelper.deleteFromServer(filterid);
    if (deleteResponse && deleteResponse.success) {
      toast.success(
        deleteResponse.data.message || i18next.t("DELETE_OK")
      );
      generateFilterList();
    } else {
      toast.error(deleteResponse?.data?.message || "ERROR");
    }
  };

  return (
    <>
      <Head>
        <title>
          {i18next.t("APP_NAME_TITLE") +
            " - " +
            i18next.t("MANAGE_FILTERS")}
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppBarGeneric />
      <div style={{ marginTop: 30, padding: 40 }} className="container-fluid">
        <h1>{i18next.t("MANAGE_FILTERS")}</h1>
        <p>{i18next.t("MANAGE_FILTERS_DESC")}</p>
        <br />
        <h2>{i18next.t("YOUR_FILTERS")}</h2>
        {addFilterForm}
        <div style={{ padding: 20, marginBottom: 20 }}>{filterList}</div>
      </div>
    </>
  );
};

export default ManageFilters;