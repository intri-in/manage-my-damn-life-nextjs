import AppBarGeneric from "@/components/common/AppBar";
import { Loading } from "@/components/common/Loading"
import AddFilter from "@/components/filters/AddFilter";
import { Toastify } from "@/components/Generic";
import { getRandomString } from "@/helpers/crypto";
import { FilterHelper } from "@/helpers/frontend/classes/FilterHelper";
import { filtertoWords, getFiltersFromServer } from "@/helpers/frontend/filters";
import { getMessageFromAPIResponse } from "@/helpers/frontend/response";
import { isDarkModeEnabled } from "@/helpers/frontend/theme";
import { dateTimeReviver } from "@/helpers/general";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { useTranslation } from "next-i18next";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageFilters = () => {
  const router = useRouter();
  const [addFilterForm, setAddFilterForm] = useState(<></>);
  const [filterList, setFilterList] = useState([<Loading />]);
  const {t} = useTranslation()
  useEffect(() => {
    setAddFilterForm(
      <div style={{ textAlign: "right" }}>
        <Button onClick={handleAddFilterButtonClick}>
          {t("ADD_NEW_FILTER")}
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
        toast.error(t(message));
      } else {
        toast.error(t("ERROR_GENERIC"));
      }
    }
    setFilterList(
      finalOutput.length > 0 ? finalOutput : [<p>{t("NO_FILTERS_TO_SHOW")}</p>]
    );
  };

  const handleAddFilterButtonClick = () => {
    setAddFilterForm(<AddFilter i18next={t} onAdd={handleAddNewFilter} />);
  };

  const handleEditFilterButtonClick = (filter) => {
    setAddFilterForm(
      <AddFilter
      i18next={t}
        filterName={filter.name}
        filter={JSON.parse(filter.filtervalue, dateTimeReviver)}
        filterid={filter.custom_filters_id}
        mode="edit"
        onAdd={handleAddNewFilter}
      />
    );
  };

  const handleAddNewFilter = (response) => {
    if (response) {
      toast.success(t("FILTER_INSERT_OK"));
    }
    generateFilterList()
    setAddFilterForm(
      <div style={{ textAlign: "right" }}>
        <Button onClick={handleAddFilterButtonClick}>
          {t("ADD_NEW_FILTER")}
        </Button>
      </div>
    );
  };

  const handleDeleteButtonClick = async (filterid) => {
    const deleteResponse = await FilterHelper.deleteFromServer(filterid);
    if (deleteResponse && deleteResponse.success) {
      toast.success(
         t("DELETE_OK")
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
          {t("APP_NAME_TITLE") +
            " - " +
            t("MANAGE_FILTERS")}
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppBarGeneric />
      <div style={{ marginTop: 30, padding: 40 }} className="container-fluid">
        <h1>{t("MANAGE_FILTERS")}</h1>
        <p>{t("MANAGE_FILTERS_DESC")}</p>
        <br />
        <h2>{t("YOUR_FILTERS")}</h2>
        {addFilterForm}
        <div style={{ padding: 20, marginBottom: 20 }}>{filterList}</div>
      </div>
    </>
  );
};

export default ManageFilters;