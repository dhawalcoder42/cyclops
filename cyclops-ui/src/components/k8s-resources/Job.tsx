import React, { useEffect, useState } from "react";
import { Col, Divider, Row, Alert, Button, Spin, Tooltip } from "antd";
import axios from "axios";
import { mapResponseError } from "../../utils/api/errors";
import PodTable from "./common/PodTable";
import { useSpring, animated } from "react-spring";

interface Props {
  name: string;
  namespace: string;
}

const Job = ({ name, namespace }: Props) => {
  const [job, setJob] = useState({
    status: "",
    pods: [],
  });

  const [error, setError] = useState({
    message: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);

  const fetchJob = () => {
    setLoading(true);
    axios
      .get(`/api/resources`, {
        params: {
          group: `batch`,
          version: `v1`,
          kind: `Job`,
          name: name,
          namespace: namespace,
        },
      })
      .then((res) => {
        setJob(res.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(mapResponseError(error));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJob();
    const interval = setInterval(() => fetchJob(), 15000);
    return () => {
      clearInterval(interval);
    };
  }, [name, namespace]);

  const fadeAnimation = useSpring({
    opacity: loading ? 0.5 : 1,
    transform: loading ? "scale(0.9)" : "scale(1)",
  });

  return (
    <div>
      {error.message.length !== 0 && (
        <Alert
          message={error.message}
          description={error.description}
          type="error"
          closable
          action={
            <Button size="small" onClick={fetchJob}>
              Retry
            </Button>
          }
          afterClose={() => {
            setError({
              message: "",
              description: "",
            });
          }}
          style={{ marginBottom: "20px" }}
        />
      )}
      <Row>
        <Divider
          style={{ fontSize: "120%", display: "flex", justifyContent: "space-between", alignItems: "center" }}
          orientationMargin="0"
          orientation={"left"}
        >
          <span>Pods: {job.pods.length}</span>
          <Tooltip title={`Status: ${job.status}`}>
            <span style={{ color: job.status === "Running" ? "green" : "red" }}>{job.status}</span>
          </Tooltip>
        </Divider>
        <Col span={24} style={{ overflowX: "auto" }}>
          <animated.div style={fadeAnimation}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin tip="Loading..." />
              </div>
            ) : (
              <PodTable namespace={namespace} pods={job.pods} />
            )}
          </animated.div>
        </Col>
      </Row>
    </div>
  );
};

export default Job;
