import type { RouteHandlers } from "@remix-run/fetch-router";
import { Document } from "../components/document";
import { render } from "../lib/html";
import type { routes } from "../routes";

export const sneakerHandlers = {
  create() {
    return render(
      <Document>
        <title>Create Sneaker</title>
        <h1>Create Sneaker</h1>
      </Document>,
    );
  },
  destroy({ params }) {
    return render(
      <Document>
        <title>Delete Sneaker</title>
        <h1>Delete Sneaker {params.id}</h1>
      </Document>,
    );
  },
  edit({ params }) {
    return render(
      <Document>
        <title>Edit Sneaker</title>
        <h1>Edit Sneaker {params.id}</h1>
      </Document>,
    );
  },
  index() {
    return render(
      <Document>
        <title>Sneakers</title>
        <h1>Sneakers</h1>
      </Document>,
    );
  },
  new() {
    return render(
      <Document>
        <title>New Sneaker</title>
        <h1>New Sneaker</h1>
      </Document>,
    );
  },
  show({ params }) {
    return render(
      <Document>
        <title>Show Sneaker</title>
        <h1>Show Sneaker {params.id}</h1>
      </Document>,
    );
  },
  update({ params }) {
    return render(
      <Document>
        <title>Update Sneaker</title>
        <h1>Update Sneaker {params.id}</h1>
      </Document>,
    );
  },
} satisfies RouteHandlers<typeof routes.sneakers>;
