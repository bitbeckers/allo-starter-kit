import { request } from "graphql-request";
import { API, Application, Project, Round, Transformers } from "../../types";
import {
  roundsQuery,
  applicationsQuery,
  roundsByIdQuery,
  projectsQuery,
  projectsByIdQuery,
} from "./queries";
import { ipfsGateway, queryToFilter } from "./utils";
import { GSRound, GSApplication, GSProject } from "./types";
import { isValid } from "date-fns";

const apiURL = "https://grants-stack-indexer-v2.gitcoin.co/graphql";

export const grantsStackAPI: Partial<API> = {
  rounds: async (query) => {
    return request<{ rounds: GSRound[] }>({
      url: apiURL,
      document: roundsQuery,
      variables: queryToFilter(query),
    }).then((res) => (res?.rounds ?? []).map(transformers.round));
  },
  roundById: (id: string, opts) => {
    return request<{ round: GSRound }>({
      url: apiURL,
      document: roundsByIdQuery,
      variables: {
        id,
        chainId: Number(opts?.chainId),
      },
    }).then((res) => transformers.round(res.round));
  },
  applications: (query) => {
    return request<{ applications: GSApplication[] }>({
      url: apiURL,
      document: applicationsQuery,
      variables: queryToFilter(query),
    }).then((res) => (res?.applications ?? []).map(transformers.application));
  },
  projects: (query) => {
    return request<{ rounds: GSProject[] }>({
      url: apiURL,
      document: projectsQuery,
      variables: queryToFilter(query),
    }).then((res) => (res?.rounds ?? []).map(transformers.project));
  },
  projectById: (id: string, opts) => {
    return request<{ project: GSProject }>({
      url: apiURL,
      document: projectsByIdQuery,
      variables: {
        id,
        chainId: Number(opts?.chainId),
      },
    }).then((res) => transformers.project(res.project));
  },
  // TODO: Implement Allo2 (implement it as a seperate provider so both GS and ezRPGF can use)
  allocate: () => {},
  distribute: () => {},
};

function validateDate(date?: string) {
  return date && isValid(new Date(date)) ? date : undefined;
}
const transformers: Transformers<GSRound, GSApplication, GSProject> = {
  round: ({
    id,
    chainId,
    roundMetadata: { name, eligibility: { description } = { description: "" } },
    matchAmount,
    matchTokenAddress,
    applications,
    applicationsStartTime,
    applicationsEndTime,
    donationsStartTime,
    donationsEndTime,
  }: GSRound): Round => ({
    id,
    chainId,
    name,
    description,
    applications,
    matching: { amount: BigInt(matchAmount), token: matchTokenAddress },
    phases: {
      roundStart: validateDate(applicationsStartTime),
      allocateStart: validateDate(donationsStartTime),
      distributeStart: validateDate(donationsEndTime),
      roundEnd: validateDate(donationsEndTime),
    },
  }),

  application: ({ id, chainId, project }: GSApplication): Application => {
    return {
      id,
      chainId,
      name: project?.metadata?.title,
      description: project?.metadata?.description,
      projectId: project?.id,
      coverImageUrl: ipfsGateway(project?.metadata.bannerImg),
    };
  },

  project: ({ id, chainId, name, metadata }: GSProject): Project => ({
    id,
    chainId,
    name,
    description: metadata?.description,
    coverImageUrl: ipfsGateway(metadata?.bannerImg),
  }),
};
