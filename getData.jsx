const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.floor(items.length / pageSize);
  let pages = range(1, num + 1);
  const list = pages.map((page) => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

function App() {
  const { Card, Row, Col } = ReactBootstrap;
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("Emeritus");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://newsapi.org/v2/everything?q=Emeritus&apiKey=eb08732b480b40b7b845d9c2acd4877a",
    {
      articles: [],
    }
  );
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.articles;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    // console.log(`currentPage: ${currentPage}`);
  }
  return (
    <Fragment>
      <form
        onSubmit={(event) => {
          doFetch(
            `https://newsapi.org/v2/everything?q=${query}&apiKey=eb08732b480b40b7b845d9c2acd4877a`
          );
          event.preventDefault();
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <>
          {Array.from({ length: 3 }).map((_, rowIdx) => (
            <Row xs={1} md={3} className="g-4" key={rowIdx}>
              {Array.from({ length: 3 }).map((_, colIdx) => (
                <Col key={colIdx}>
                  {page.map((item, index) => {
                    if (index == rowIdx * 3 + colIdx) {
                      return (
                        <Card
                          // bg="secondary"
                          key={rowIdx * 3 + colIdx}
                          text="white"
                          style={{ width: "35rem", backgroundColor: "DimGray" }}
                          className="mb-2"
                        >
                          <Card.Body>
                            <Card.Title>{item.title}</Card.Title>
                            <Card.Subtitle className="mb-2 white">
                              {item.description}
                            </Card.Subtitle>
                            <Card.Text>{item.content}</Card.Text>
                            <Card.Link href={item.url}>
                              Read full article
                            </Card.Link>
                          </Card.Body>
                        </Card>
                      );
                    }
                  })}
                </Col>
              ))}
            </Row>
          ))}
        </>
      )}
      <Pagination
        items={data.articles}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
