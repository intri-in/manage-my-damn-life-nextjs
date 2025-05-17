import { useState, useEffect } from "react";
import { Badge, Button, Col, Row } from "react-bootstrap";
import { Loading } from "./common/Loading";
import { SketchPicker } from "react-color";
import { BACKGROUND_GRAY } from "@/config/style";
import { toast } from "react-toastify";
import { isValidResultArray } from "@/helpers/general";
import {
  getAllLabelsFromDexie,
  updateLabelCacheInDexie,
  updateLabelColourinDexie,
} from "@/helpers/frontend/dexie/dexie_labels";
import { isDarkModeEnabled } from "@/helpers/frontend/theme";
import { useTranslation } from "next-i18next";

const LabelManager = ({  }) => {
  const [labelTable, setLabelTable] = useState(<Loading />);
  const [displayColorPicker, setDisplayColorPicker] = useState({});
  const [color, setColor] = useState({});
  const [labels, setLabels] = useState({});
  const [currentTarget, setCurrentTarget] = useState("");
  const {t} = useTranslation()
  useEffect(() => {
    getLabelsFromDexie();
  }, []);

  const updateLabels = async () => {
    toast.info(t("UPDATING_LABEL_CACHE"));
    setLabels({});
    setDisplayColorPicker({});
    setColor({});
    await updateLabelCacheInDexie();
    getLabelsFromDexie();
  };

  const handleChangeofColor = (selectedColor) => {
    setColor((prevColors) => ({
      ...prevColors,
      [currentTarget]: selectedColor.hex,
    }));
  };

  const handleColorClose = (labelName) => {
    setDisplayColorPicker((prevDisplay) => ({
      ...prevDisplay,
      [labelName]: !prevDisplay[labelName],
    }));
    setCurrentTarget("");

    makeModifyLabelRequest(labelName, color[labelName]);
  };

  const makeModifyLabelRequest = async (labelName, color) => {
    await updateLabelColourinDexie(labelName, color);
    getLabelsFromDexie();
    toast.success(t("UPDATE_OK"));
  };

  const handleClick = (labelName) => {
    setDisplayColorPicker((prevDisplay) => ({
      ...prevDisplay,
      [labelName]: !prevDisplay[labelName],
    }));
    setCurrentTarget(labelName);
  };

  const getLabelsFromDexie = async () => {
    const labelsFromDexie = await getAllLabelsFromDexie();
    if (isValidResultArray(labelsFromDexie) && labelsFromDexie) {
      setLabels(labelsFromDexie);

      const displayPicker = {};
      const colorPicker = {};
      for (const key in labelsFromDexie) {

        displayPicker[labelsFromDexie[key]!.name!] = false;
        colorPicker[labelsFromDexie[key]!.name!] = labelsFromDexie[key].colour;
      }
      setDisplayColorPicker(displayPicker);
      setColor(colorPicker);
    }
  };

  const getLabelTable = () => {
    const background = isDarkModeEnabled() ? "dimgray" : BACKGROUND_GRAY;
    return Object.keys(labels).map((key) => {
      const label = labels[key];
      const border = `1px solid ${color[label.name]}`;
      return (
        <Row
          key={`${label.name}_ROW`}
          style={{ background, margin: 20, padding: 20 }}
        >
          <Col>
            <Badge
              key={label.name}
              bg="light"
              pill
              style={{
                margin: 5,
                borderColor: "pink",
                border,
                color: color[label.name],
                textDecorationColor: "white",
              }}
            >
              {label.name}
            </Badge>
          </Col>
          <Col>
            <div
              style={{
                padding: "5px",
                background: "#fff",
                borderRadius: "1px",
                boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
                display: "inline-block",
                cursor: "pointer",
              }}
              onClick={() => handleClick(label.name)}
            >
              <div
                style={{
                  background: color[label.name],
                  width: "36px",
                  height: "14px",
                  borderRadius: "2px",
                }}
              ></div>
            </div>
            {displayColorPicker[label.name] && (
              <div
                key={`${label.name}_COLORPICKER`}
                style={{
                  position: "absolute",
                  zIndex: "2",
                }}
              >
                <div
                  onClick={() => handleColorClose(label.name)}
                  style={{
                    position: "fixed",
                    top: "0px",
                    right: "0px",
                    bottom: "0px",
                    left: "0px",
                  }}
                ></div>
                <SketchPicker
                  color={color[label.name]}
                  onChange={handleChangeofColor}
                />
              </div>
            )}
          </Col>
        </Row>
      );
    });
  };

  return (
    <>
      <h1>{t("LABEL_MANAGER")}</h1>
      <br />
      <div style={{ textAlign: "right" }}>
        <Button size="sm" onClick={updateLabels}>
          {t("UPDATE_LABEL_CACHE")}
        </Button>
      </div>
      <br />
      {getLabelTable()}
    </>
  );
};

export default LabelManager;