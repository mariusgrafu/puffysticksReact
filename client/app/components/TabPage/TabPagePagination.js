import React, { Component } from 'react';

class TabPagePagination extends Component {

  constructor(props){
    super(props);

  }

    getOutput = () => {
    const {
        currentPage,
        pageCount,
        colors,
        gotoPage
    } = this.props;

    let arrowStyle = {
        style : {
            color : colors._active.accent
        }
    }

    let output = [];

    output.push(
        <div
        className={"tppJump" + ((currentPage == 1)?" disabled":"")}
        onClick={() => gotoPage(1)}
        >
        first
        </div>
    );
    output.push(
        <i
        className={"pufficon-pagearrow tppArrow tppPrev" + ((currentPage == 1)?" disabled":"")}
        {...arrowStyle}
        data-tooltip="prev"
        onClick={() => gotoPage(Math.max(currentPage - 1, 1))}
        />
    );

    if(currentPage <= pageCount - 2){
        let extra = 1;

        if(currentPage != 1){
            extra = 0;
            output.push(
                <div className="tppPage"
                onClick={() => gotoPage(currentPage - 1)}
                >
                    {currentPage - 1}
                </div>
            );
        }
        output.push(
            <div className="tppPage active">{currentPage}</div>
        );
        for(let i = currentPage + 1; (i <= pageCount) && (i <= currentPage + 2 + extra); ++i){
            output.push(
                <div className="tppPage"
                onClick={() => gotoPage(i)}
                >
                    {i}
                </div>
            );
        }
    
        // if(i <= pageCount){
        //     output.push(
                    
        //         <div className="tppPage"
        //         onClick={() => gotoPage(pageCount)}
        //         >
        //         {pageCount}
        //         </div>
        //     );
        //     if(i != pageCount){
        //         output.push(
        //             <div className="tppDots">...</div>
        //         );
        //     }
        // }

    }else{
        // output.push(
        //     <div className="tppPage"
        //     onClick={() => gotoPage(1)}
        //     >1</div>
        // );
        // output.push(
        //     <div className="tppDots">...</div>
        // );
        for(let i = Math.max(currentPage - 3, 2); (i <= pageCount) && (i < currentPage); ++i){
            output.push(
                <div className="tppPage"
                onClick={() => gotoPage(i)}
                >
                    {i}
                </div>
            );
        }
        output.push(
            <div className="tppPage active">{currentPage}</div>
        );
        
        if(currentPage != pageCount){
            output.push(
                <div className="tppPage"
                onClick={() => gotoPage(currentPage + 1)}
                >
                    {currentPage + 1}
                </div>
            );
        }
        

    }

    output.push(
        <i
        className={"pufficon-pagearrow tppArrow" + ((currentPage == pageCount)?" disabled":"")}
        {...arrowStyle}
        data-tooltip="next"
        onClick={() => gotoPage(Math.min(currentPage + 1, pageCount))}
        />
    );
    output.push(
        <div
        className={"tppJump" + ((currentPage == pageCount)?" disabled":"")}
        onClick={() => gotoPage(pageCount)}
        >
        last
        </div>
    );

    return output;
  }

  render() {
    const {
        parentLoading,
        pageCount,
    } = this.props;
    
    const output = this.getOutput();

    return (
      <>
      {
          (!parentLoading && pageCount > 1)?(
            <div className="tabPagePaginationCont">
            <div className="mainWrap">
                <div className="tabPagePaginationWrap noSelect">
                    {
                        output.map( (o, i) => {
                            return(
                                <React.Fragment key={i} >
                                    {o}
                                </React.Fragment>
                            )
                        })
                    }
                </div>
            </div>
            </div>
          ):('')
      }
      </>
    );
  }
}

export default TabPagePagination;
